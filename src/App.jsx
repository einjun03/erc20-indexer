
import { useState } from 'react';

function App() {
  const [currentQuery, setcurrentQuery] = useState('');
  const [userAddress, setUserAddress] = useState('');
  const [data, setData] = useState([]);
  const [state, setState] = useState('Idle');
  const [tokenDataObjects, setTokenDataObjects] = useState([]);
  const [tokens, setTokens] = useState(0)

  async function getTokenBalance() {
    //if the previous query was the same as the current query, just use it
    if (currentQuery == userAddress) {
      console.log("Same as Previous Query")
      //early return, do nothing
      return;
    } else {
      //reset the states from the previous query
      setData([]);
      setState('Fetching User Token Balances...')
      //set currentQuery to userAddress
      setcurrentQuery(userAddress);
      setTokens(0);
    }
    console.log("User Address: ", userAddress)

    //catch when invalid address error
    let results;
    try {
      const response = await fetch(`/api/balances?address=${userAddress}`);
      results = await response.json();
      console.log(results);

    } catch (error) {
      //set error reason to show to user
      setState(error.reason)
      return;
    }
    setData(results);
    //if no coins then nothing to query
    if(results.tokenBalances.length == 0) {
      setState('User has no ECR-20 Tokens')
      return;
    }
    setState('Fetching Token MetaData...')
    setTokens(results.tokenBalances.length);
    const tokenDataPromises = [];

    for (let i = 0; i < results.tokenBalances.length; i++) {
      //var = promise.then(var (represents what is returned by the promise)=> call to run on var)
      //call to run on var runs after promise resolves
      //console.log(results.tokenBalances[i].contractAddress);
      const tokenData = fetch(`/api/metadata?contract_address=${results.tokenBalances[i].contractAddress}`).then(response => response.json())
      tokenDataPromises.push(tokenData);
    }

    const resolved_data = await Promise.all(tokenDataPromises);
    setTokenDataObjects(resolved_data);
    console.log(resolved_data)
    setState('Idle')
  }

  //when something happens to the component onChange is field of, event object is triggered which contains info about what happened
  //event.target = the DOM element that triggered the event
  return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center">
          <h1 className='text-xl font-sans'>
            ERC-20 Token Indexer
          </h1>
          <p className='font-sans'>
            Plug in an address and this website will return all of its ERC-20
            token balances!
          </p>
          <div className='flex gap-2'>
            <input 
              type="text" 
              onChange={(e) => setUserAddress(e.target.value)}
              value={userAddress}
              placeholder="Input Address Here..." 
              className="input input-md border border-gray-300 rounded px-3 py-2 mt-4 w-full" 
            />
            <button onClick={getTokenBalance} className='bg-black text-white rounded px-3 py-2 mt-4'>Submit</button>
          </div>
          <div className='flex mt-4'>
            {/*conditional rendering for search results */}
            {/* js compares objects by reference (memory location) so results === [] will always return false */}
            {state != 'Idle' && <p className='font-sans'>{state}</p>}
            {/*conditional rendering for displaying search results */}
            {state == 'Idle'}
          </div>
      </div>
  );
}

export default App;
