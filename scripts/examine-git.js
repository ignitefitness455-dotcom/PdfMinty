import { execSync } from 'child_process';

try {
  console.log('--- GIT STATUS ---');
  console.log(execSync('git status', { encoding: 'utf8' }));
  
  console.log('--- GIT LOG ---');
  console.log(execSync('git log --oneline -n 10', { encoding: 'utf8' }));
} catch (error) {
  console.error('Error running git commands:', error.message);
}
