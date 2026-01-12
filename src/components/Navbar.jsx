import { Link } from 'react-router-dom';

export default function Navbar() {
    return (<div className="navbar bg-base-100 text-start shadow-sm">
  <div className="flex-1">
    <a className="btn btn-ghost text-4xl"><Link to="/">Vault.</Link></a>
  </div>
  <div className="flex-none">
    <ul className="menu menu-horizontal px-3 text-xl gap-5 font-semibold">
      <li>
        <details>
          <summary className="w-50 justify-center gap-5">ERC-20 Tokens</summary>
          <ul className="bg-base-100 rounded-t-none p-2 w-50 z-50">
            <li><Link to="/WalletBalances"><a>Balance Search</a></Link></li>
            <li><Link to="/TokenIndex"><a>Token Index</a></Link></li>
          </ul>
        </details>
      </li>
      <li>
        <details>
          <summary className="w-50 justify-center gap-5">Login / Register</summary>
          <ul className="bg-base-100 rounded-t-none p-2 w-50 z-50">
            <li><Link to="/Login"><a>Login</a></Link></li>
            <li><Link to="/Register"><a>Register</a></Link></li>
          </ul>
        </details>
      </li>
    </ul>
  </div>
</div>)
}