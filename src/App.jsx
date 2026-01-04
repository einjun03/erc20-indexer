
import { useState } from 'react';

function App() {
  const [userAddress, setUserAddress] = useState('');
  const [results, setResults] = useState([]);
  const [hasQueried, setHasQueried] = useState(false);
  const [tokenDataObjects, setTokenDataObjects] = useState([]);

  async function getTokenBalance() {
    const response = await fetch(`/api/balances?address=${userAddress}`);
    const data = await response.json();
    console.log(data);

    setResults(data);

    const tokenDataPromises = [];

    for (let i = 0; i < data.tokenBalances.length; i++) {
      const response = await fetch(`/api/metadata?contract_address=${data.tokenBalances[i].contractAddress}`)
      const tokenData = await response.json();
      tokenDataPromises.push(tokenData);
    }

    setTokenDataObjects(await Promise.all(tokenDataPromises));
    setHasQueried(true);
  }
  return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center">
          <h1 className='text-xl font-sans'>
            ERC-20 Token Indexer
          </h1>
          <p className='font-sans'>
            Plug in an address and this website will return all of its ERC-20
            token balances!
          </p>
      </div>
  );
}

export default App;
