var express = require('express');
var router = express.Router();
const { exec } = require('child_process');
const dotenv = require('dotenv');
dotenv.config();

const KEY = process.env.KEY;

const MODE = {
  NAME : 'MODE',
  FILE: 'l3mode-sepolia-config.yaml',
  CHAIN: 'l3mode',
}

const GELATO = {
  NAME : 'GELATO',
  FILE: 'l3Gelato-sepolia-config.yaml',
  CHAIN: 'l3Gelato',
}

const CALDERA = {
  NAME : 'CALDERA',
  FILE: 'l3Caldera-sepolia-config.yaml',
  CHAIN: 'l3Caldera',
}


/* GET users listing. */
router.post('/', function(req, res, next) {
  const postData = req.body;
  const recipient = req.body.recipient;

  let fileCommand = '';
  let chainCommand=''

  if (chain === MODE.NAME) {
    fileCommand = MODE.FILE
    chainCommand = MODE.CHAIN
  } else if (chain === GELATO.NAME) {
    fileCommand = GELATO.FILE
    chainCommand = GELATO.CHAIN
  } else if (chain === CALDERA.NAME) {
    fileCommand = CALDERA.FILE
    chainCommand = CALDERA.CHAIN
  } else {
    res.status(500).send('잘못된 chain 이름입니다.');
    return;
  }

  let command = `hyperlane send transfer --warp deployments/warp_routes/BB/${fileCommand} --wei 777777 --key ${KEY} --origin ${chainCommand} --destination sepolia --recipient ${recipient}`;
  //command='ls -la'
  console.log('command', command);
  console.log('command start')
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`에러 발생: ${error.message}`);
      res.status(500).send('서버에서 명령어 실행 중 에러가 발생했습니다.');
      return;
    }
    if (stderr) {
      console.error(`명령어 실행 중 에러: ${stderr}`);
      res.status(500).send('서버에서 명령어 실행 중 에러가 발생했습니다.');
      return;
    }
    console.log(`명령어 실행 결과: ${stdout}`);
    res.send(stdout);
  });
});

module.exports = router;
