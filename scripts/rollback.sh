#!/bin/bash

# ANSI Color Codes
RESET="\033[0m"
BOLD="\033[1m"
RED="\033[31m"
GREEN="\033[32m"
YELLOW="\033[33m"
CYAN="\033[36m"
MAGENTA="\033[35m"
DIM="\033[2m"

PATCH_DIR=".cleaning-patches"

echo -e "${CYAN}${BOLD}=======================================================${RESET}"
echo -e "${CYAN}${BOLD}🔄 PDFMINTY CLEANING ROLLBACK UTILITY${RESET}"
echo -e "${CYAN}${BOLD}=======================================================${RESET}"

# 1. Check if .cleaning-patches/ directory exists
if [ ! -d "$PATCH_DIR" ]; then
    echo -e "${RED}${BOLD}❌ ERROR: Directory '$PATCH_DIR/' does not exist!${RESET}"
    echo -e "${YELLOW}No backup patches are available to restore from.${RESET}"
    exit 1
fi

# Find all patch files
# Using IFS to handle files correctly
SAVEIFS=$IFS
IFS=$'\n'
PATCH_FILES=($(find "$PATCH_DIR" -name "*.patch" | sort))
IFS=$SAVEIFS

if [ ${#PATCH_FILES[@]} -eq 0 ]; then
    echo -e "${YELLOW}⚠️  No patch files (.patch) found inside '$PATCH_DIR/'.${RESET}"
    exit 0
fi

# 2. List all available patches with timestamps
echo -e "\n📦 Available restore/rollback patches in '${PATCH_DIR}/':"
echo -e "--------------------------------------------------------"
for i in "${!PATCH_FILES[@]}"; do
    FILE="${PATCH_FILES[$i]}"
    # Get file modification timestamp safely across macOS and Linux environments
    if [[ "$OSTYPE" == "darwin"* ]]; then
        TIME_STR=$(stat -f "%Sm" -t "%Y-%m-%d %H:%M:%S" "$FILE" 2>/dev/null || echo "Unknown time")
    else
        TIME_STR=$(stat -c "%y" "$FILE" 2>/dev/null | cut -d'.' -f1 || echo "Unknown time")
    fi
    FILENAME=$(basename "$FILE")
    echo -e "  [${CYAN}$((i+1))${RESET}] ${BOLD}${FILENAME}${RESET}"
    echo -e "      ${DIM}Created: ${TIME_STR}${RESET}"
done
echo -e "--------------------------------------------------------"

# 3. Prompt user: rollback all, rollback specific, or cancel
echo -e "\n${BOLD}Select a roll-back operation:${RESET}"
echo -e "  [${GREEN}A${RESET}] Rollback ALL approved cleaning changes (reverse-apply all patches)"
echo -e "  [${GREEN}S${RESET}] Rollback a SPECIFIC patch file"
echo -e "  [${GREEN}C${RESET}] Cancel / Exit"

read -p "Enter choice (A / S / C): " CHOICE
CHOICE=$(echo "$CHOICE" | tr '[:lower:]' '[:upper:]')

apply_reverse_patch() {
    local patch_path="$1"
    echo -e "\nApplying patch in reverse: ${YELLOW}$patch_path${RESET}"
    
    # Trace the target file path directly from the patch header
    local target_file=$(grep -m 1 "^--- a/" "$patch_path" | cut -c 7-)
    
    # Path Traversal Guard in Bash variables
    if [[ "$target_file" == *"../"* ]] || [[ "$target_file" == *"..\\"* ]]; then
        echo -e "${RED}❌ SECURITY VIOLATION: Path traversal blocked on target: $target_file${RESET}"
        return 1
    fi

    # Strict Character whitelist validation (alphanumeric, dot, dash, underscore, forward slash only)
    if [[ ! "$target_file" =~ ^[a-zA-Z0-9_\.\/-]+$ ]]; then
        echo -e "${RED}❌ SECURITY VIOLATION: Invalid target filename character pattern: $target_file${RESET}"
        return 1
    fi

    # Dry-run check first
    git apply --check -R "$patch_path" 2>/dev/null
    if [ $? -eq 0 ]; then
        git apply -R "$patch_path"
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Successfully rolled back patch via git: $(basename "$patch_path")${RESET}"
            return 0
        fi
    fi

    # If git reverse-apply fails, fallback to physical .bak restore if available (highly robust!)
    local bak_path="${patch_path%.patch}.bak"
    if [ -f "$bak_path" ] && [ -n "$target_file" ]; then
        echo -e "${YELLOW}⚠️  Git reverse-apply failed/rejected. Falling back to physical .bak restoration...${RESET}"
        cp "$bak_path" "$target_file"
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Successfully restored file context: $target_file${RESET}"
            return 0
        else
            echo -e "${RED}❌ Failed physical copy from bak: $bak_path to $target_file${RESET}"
            return 1
        fi
    else
        echo -e "${RED}❌ git apply -R failed, and no physical .bak archive was found for: $(basename "$patch_path")${RESET}"
        read -p "Force git apply with reject hunks? (y/N): " FORCE_CHOICE
        FORCE_CHOICE=$(echo "$FORCE_CHOICE" | tr '[:lower:]' '[:upper:]')
        if [ "$FORCE_CHOICE" = "Y" ]; then
            git apply --reject -R "$patch_path"
            return $?
        else
            echo -e "${YELLOW}Skipping rollback for this patch.${RESET}"
            return 1
        fi
    fi
}

case "$CHOICE" in
    A)
        echo -e "\n${RED}${BOLD}🚨 WARNING: This will revert ALL cleaning changes from the listed patches!${RESET}"
        read -p "Are you absolutely sure you want to rollback all patches? (y/N): " CONFIRM
        CONFIRM=$(echo "$CONFIRM" | tr '[:lower:]' '[:upper:]')
        if [ "$CONFIRM" != "Y" ]; then
            echo -e "${YELLOW}Operation cancelled.${RESET}"
            exit 0
        fi
        
        # Apply patch files in reverse order (newest to oldest)
        echo -e "\n🔄 Restoring files..."
        SUCCESS=true
        for (( idx=${#PATCH_FILES[@]}-1 ; idx>=0 ; idx-- )); do
            apply_reverse_patch "${PATCH_FILES[$idx]}"
            if [ $? -ne 0 ]; then
                SUCCESS=false
            fi
        done
        
        if [ "$SUCCESS" = true ]; then
            echo -e "\n${GREEN}${BOLD}🎉 All patches have been successfully reversed!${RESET}"
        else
            echo -e "\n${YELLOW}⚠️  Some patches could not be auto-reversed. See warnings above status.${RESET}"
        fi
        ;;
        
    S)
        read -p "Enter the number of the patch you wish to rollback (1-${#PATCH_FILES[@]}): " PATCH_NUM
        if [[ ! "$PATCH_NUM" =~ ^[0-9]+$ ]] || [ "$PATCH_NUM" -lt 1 ] || [ "$PATCH_NUM" -gt "${#PATCH_FILES[@]}" ]; then
            echo -e "${RED}❌ Invalid selection. Exiting.${RESET}"
            exit 1
        fi
        
        SELECTED_PATCH="${PATCH_FILES[$((PATCH_NUM-1))]}"
        echo -e "\n${RED}${BOLD}🚨 WARNING: Reverting patch: $(basename "$SELECTED_PATCH")${RESET}"
        read -p "Confirm rollback? (y/N): " CONFIRM
        CONFIRM=$(echo "$CONFIRM" | tr '[:lower:]' '[:upper:]')
        if [ "$CONFIRM" != "Y" ]; then
            echo -e "${YELLOW}Operation cancelled.${RESET}"
            exit 0
        fi
        
        apply_reverse_patch "$SELECTED_PATCH"
        ;;
        
    *)
        echo -e "${YELLOW}Operation cancelled. No changes were made.${RESET}"
        exit 0
        ;;
esac

# 4. Verifies working tree status
echo -e "\n${CYAN}=======================================================${RESET}"
echo -e "${CYAN}📊 VERIFYING WORKING TREE STATE${RESET}"
echo -e "${CYAN}=======================================================${RESET}"

echo -e "${DIM}Running: git status...${RESET}"
git status

echo -e "\n${GREEN}${BOLD}Rollback procedure completed successfully.${RESET}\n"
