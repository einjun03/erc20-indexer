
import { useState } from 'react';
import { TokenCard, TokenCardSkeleton } from '../components/TokenCard';

function WalletBalances() {
  const [currentQuery, setcurrentQuery] = useState('');
  const [userAddress, setUserAddress] = useState('');
  const [data, setData] = useState([]);
  const [state, setState] = useState('Idle');
  const [tokenDataObjects, setTokenDataObjects] = useState([]);

  async function getTokenBalance() {
    //0. reset states
    //if the previous query was the same as the current query, just use it
    setUserAddress(prev => prev.trim());
    if (currentQuery == userAddress) {
      console.log("Same as Previous Query")
      //early return, do nothing
      return;
    } else {
      //reset the states from the previous query
      setData([]);
      //reset token data objects
      setTokenDataObjects([]);
      setState('Fetching User Token Balances...')
      //set currentQuery to userAddress
      setcurrentQuery(userAddress);
    }
    console.log("User Address: ", userAddress)

    //1. Get user's token balances
    //catch when invalid address error
    let results;
    try {
      const response = await fetch(`/api/balances?address=${userAddress}`);
      results = await response.json();
      console.log(results);

    } catch (error) {
      console.log(error)
      //set error reason to show to user
      setState(error.reason || "Error Fetching Balances: Try again with a valid address.")
      return;
    }
    setData(results);
    //if no coins then nothing to query
    if(results.tokenBalances.length == 0) {
      setState('User has no ECR-20 Tokens')
      return;
    }

    //2. Fetch token metadata
    setState('Fetching Token MetaData...')
    setTokenDataObjects(Array(results.tokenBalances.length).fill(null));
    const tokenDataPromises = [];

    for (let i = 0; i < results.tokenBalances.length; i++) {
      //var = promise.then(var (represents what is returned by the promise)=> call to run on var)
      //call to run on var runs after promise resolves
      //console.log(results.tokenBalances[i].contractAddress);
      const tokenData = fetch(`/api/metadata?contract_address=${results.tokenBalances[i].contractAddress}`).then(response => response.json())
      tokenDataPromises.push(tokenData);
    }

    //add data as promises resolve
    //list((listItem, index) => {some function to execute})
    //promise.then(returnVal => {function})
    //SetterFunction(current value => {return value to update to})
    //only update the index that is currently resolved in the current array
    tokenDataPromises.forEach((promise, index) => {
      promise.then(tokenData => {
        setTokenDataObjects(prev => {
          //create copy (react wont detect change (new array item) since the array is the same array (same place in memory))
          const updated_data = [...prev];
          updated_data[index] = tokenData;
          console.log(tokenData);
          return updated_data;
        })
      })
    })

    await Promise.all(tokenDataPromises)
    setState('Idle');
  }

  //When something happens to the component onChange is field of, event object is triggered which contains info about what happened
  //event.target = the DOM element that triggered the event
  return (
      <div className="relative flex flex-col min-h-screen text-center w-full bg-base-100">
        {/*anchor 50% from left; shift back by 50% of element width*/}
        <div className='sticky top-10 z-10 pt-20  rounded-2xl flex justify-center items-center'>
          <div className='relative'>
            <input
              type="text"
              onChange={(e) => setUserAddress(e.target.value)}
              value={userAddress}
              placeholder="Enter wallet address to see wallet ERC-20 Balances"
              className="input input-lg bg-base-300/80 pl-5 w-180 text-base-content placeholder:text-base-content/40 text-lg font-mono border-2 border-primary/30 focus:border-primary focus:outline-none transition-all"
            />
            <button onClick={getTokenBalance} className='btn btn-primary w-30 btn-lg absolute right-0.25 text-lg font-bold shadow-lg hover:shadow-primary/50 transition-all'>Search</button>
          </div>
        </div>
          {/*Results (px for horizontal border)*/}
          <div className='flex w-full justify-center items-center mt-4 px-10 py-5 pt-10'>
            {/*conditional rendering for search results */}
            {/* js compares objects by reference (memory location) so results === [] will always return false */}
            {/*conditional rendering for displaying search results */}
            {state === 'Idle' && !currentQuery ? <p className='text-2xl font-semibold text-primary'>Search to Display Balances</p> : 
              state != 'Idle' && tokenDataObjects.length == 0 ?
                <p className='text-2xl font-semibold text-primary animate-pulse'>{state}</p>
                :
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full'>
                  {tokenDataObjects.map((token, i) =>
                    token ?
                      <TokenCard key={i} token={token} balance={data.tokenBalances[i].tokenBalance} />
                      :
                      <TokenCardSkeleton key={i} />
                  )}
                </div>
            } 
          </div>
      </div>
  );
}

export default WalletBalances;
