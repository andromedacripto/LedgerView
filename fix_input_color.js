const fs = require('fs');

const filePath = process.argv[2] || 'app/components/AgentChat.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const oldClass = 'className="flex-1 text-sm px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"';
const newClass = 'className="flex-1 text-sm px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 placeholder-gray-400 bg-white"';

if (content.includes(oldClass)) {
  content = content.replace(oldClass, newClass);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('OK - cor do input corrigida');
} else {
  console.log('ERRO - padrao nao encontrado, verifique manualmente');
}
