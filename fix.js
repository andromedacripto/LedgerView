const fs = require('fs');
let lines = fs.readFileSync('app/components/BaseWalletChecker.tsx', 'utf8').split(/\r?\n/);
// Encontra a penultima linha que tem '    </div>' (fecha o div raiz do return)
let lastDiv = -1;
for (let i = lines.length - 1; i >= 0; i--) {
  if (lines[i].trim() === '</div>') {
    lastDiv = i;
    break;
  }
}
if (lastDiv !== -1) {
  lines.splice(lastDiv, 0, '      <AgentChat />');
  fs.writeFileSync('app/components/BaseWalletChecker.tsx', lines.join('\n'));
  console.log('OK - AgentChat inserido na linha', lastDiv);
} else {
  console.log('ERRO');
}
