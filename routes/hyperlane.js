var express = require('express');
var router = express.Router();
const { exec } = require('child_process');
const { ethers } = require('ethers');
const dotenv = require('dotenv');
dotenv.config();

const KEY = process.env.KEY;

const MODE = {
  NAME : 'MODE',
  FILE: 'l3mode-sepolia-config.yaml',
  CHAIN: 'l3mode',
  PROVIDER : new ethers.JsonRpcProvider(process.env.MODE_PROVIDER),
  TOKEN: '0xfdb804EEF58Cb5eF63A5F9310b8a74E64dC5401B',
}

const GELATO = {
  NAME : 'GELATO',
  FILE: 'l3Gelato-sepolia-config.yaml',
  CHAIN: 'l3Gelato',
  PROVIDER: new ethers.JsonRpcProvider(process.env.GELATO_PROVIDER),
  TOKEN: '0x6b175474e89094c44da98b954eedeac495271d0f',
}

const CALDERA = {
  NAME : 'CALDERA',
  FILE: 'l3Caldera-sepolia-config.yaml',
  CHAIN: 'l3Caldera',
  PROVIDER: new ethers.JsonRpcProvider(process.env.CALDERA_PROVIDER),
  TOKEN: '0x6b175474e89094c44da98b954eedeac495271d0f',
}


/* GET users listing. */
router.post('/', async function(req, res, next) {
  let {chain, recipient, amount } = req.body;

  amount = ethers.utils.parseEther(amount.toString())
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

  let command = `hyperlane send transfer --warp deployments/warp_routes/BB/${fileCommand} --wei ${amount} --key ${KEY} --origin ${chainCommand} --destination sepolia --recipient ${recipient}`;
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
router.post('/transfer', async function(req, res, next) {
   try {
     const {chain, recipient, amount } = req.body;
     let provider;
     let tokenAddress;
     if(chain === 'MODE') {
       provider = MODE.PROVIDER;
       tokenAddress = MODE.TOKEN;
     }else if(chain === 'GELATO') {
       provider = GELATO.PROVIDER;
       tokenAddress = GELATO.TOKEN
     }else if(chain === 'CALDERA') {
       provider = CALDERA.PROVIDER;
       tokenAddress = CALDERA.TOKEN
     }else {
       res.status(500).send('잘못된 chain 이름입니다.');
       return;
     }

     const wallet = new ethers.Wallet(KEY, provider);

     const tokenContract = new ethers.Contract(tokenAddress, [
       'function transfer(address to, uint256 amount) returns (bool)'
     ], wallet);

     const tx = await tokenContract.transfer(recipient, ethers.parseEther(amount.toString()));

     // 트랜잭션 해시 반환
     res.json({ transactionHash: tx.hash });

   }catch (e){
     console.error('에러 발생:', error);
     res.status(500).json({ error: '서버에서 오류가 발생했습니다.' });
   }


});

module.exports = router;
