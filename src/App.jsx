
import { useState } from 'react';
import { Utils } from 'alchemy-sdk';

function App() {
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
    await tokenDataPromises.forEach((promise, index) => {
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
    setState('Idle');
  }

  //When something happens to the component onChange is field of, event object is triggered which contains info about what happened
  //event.target = the DOM element that triggered the event
  return (
      <div className="relative flex flex-col items-start min-h-screen text-center w-full bg-base-100">
        {/*anchor 50% from left; shift back by 50% of element width*/}
        <div className='sticky top-10 z-10 w-3/4 p-8 pl-10 rounded-2xl bg-base-200/50 backdrop-blur-sm shadow-2xl items-start'>
          <p className='text-base-content/90 text-xl mb-8 font-light tracking-wide text-left'>
          </p>
          <div className='flex gap-3 w-full text-left'>
            <input
              type="text"
              onChange={(e) => setUserAddress(e.target.value)}
              value={userAddress}
              placeholder="Enter wallet address to see wallet ERC-20 Balances"
              className="input input-lg bg-base-300/80 text-base-content placeholder:text-base-content/40 w-3/4 text-lg font-mono border-2 border-primary/30 focus:border-primary focus:outline-none transition-all"
            />
            <button onClick={getTokenBalance} className='btn btn-primary btn-lg text-lg font-bold shadow-lg hover:shadow-primary/50 transition-all'>Search</button>
          </div>
        </div>
          {/*Results (px for horizontal border)*/}
          <div className='flex w-full justify-center items-center mt-4 px-10 py-5 pt-20'>
            {/*conditional rendering for search results */}
            {/* js compares objects by reference (memory location) so results === [] will always return false */}
            {/*conditional rendering for displaying search results */}
            {state != 'Idle' && tokenDataObjects.length == 0 ?
              <p className='text-2xl font-semibold text-primary animate-pulse'>{state}</p>
              :
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full'>
                {tokenDataObjects.map( (token, i) =>
                  token ?
                  <div key={i} className='card w-full bg-gradient-to-br from-base-200 to-base-300 text-base-content shadow-2xl hover:shadow-primary/30 transition-all duration-300 border-2 border-primary/20 hover:border-primary/50 hover:scale-105'>
                    {/* align them to the top: items center gap-2: 8 px spacing between items pt: padding on top*/}
                      <div className="card-body p-6">
                        <div className="flex flex-col items-start gap-5">
                          <div className="flex flex-row gap-4 items-center pb-4 border-b border-primary/20">
                            {token.logo ?
                              <img src={token.logo} className='w-12 h-12 rounded-full ring-2 ring-primary/30' alt={token.symbol} />
                              :
                              <div className='w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-primary-content font-black text-xl shadow-lg'>{token.symbol?.[0] || '?'}</div>
                            }
                            <div className="flex flex-col items-start flex-1">
                              <h2 className="text-xl font-extrabold text-base-content truncate w-full">{token.name}</h2>
                              <p className="text-sm text-primary font-semibold">${token.symbol}</p>
                            </div>
                          </div>
                          <div className="w-full bg-base-100/30 rounded-lg p-4">
                            <p className="text-xs text-base-content/60 uppercase tracking-widest mb-2 font-bold">Your Balance</p>
                            <p className="text-2xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent break-all">
                              {Utils.formatUnits(data.tokenBalances[i].tokenBalance, token.decimals)}
                            </p>
                            <p className="text-sm text-base-content/70 font-semibold mt-1">{token.symbol}</p>
                          </div>
                        </div>
                      </div>
                  </div>
                  :
                  <div key={i} className='card w-full bg-base-200/300 text-base-content shadow-xl border-2 border-primary/10 animate-pulse'>
                    <div className="card-body p-6">
                      <div className="flex flex-col items-start gap-5">
                        {/* Match the header section */}
                        <div className="flex flex-row gap-4 items-center pb-4 border-b border-primary/20 w-full">
                          <div className='w-12 h-12 bg-primary/20 rounded-full'></div>
                          <div className='flex-1'>
                            <div className='h-5 bg-primary/20 rounded w-3/4 mb-2'></div>
                            <div className='h-4 bg-primary/10 rounded w-1/2'></div>
                          </div>
                        </div>
                        {/* Match the balance section */}
                        <div className="w-full bg-base-100/30 rounded-lg p-4">
                          <div className='h-3 bg-primary/10 rounded w-1/3 mb-2'></div>
                          <div className='h-8 bg-primary/20 rounded w-full mb-1'></div>
                          <div className='h-4 bg-primary/10 rounded w-1/4'></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            }
          </div>
      </div>
  );
}

export default App;
