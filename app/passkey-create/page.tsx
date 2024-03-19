'use client';
import { useEffect, useState } from 'react';
import { usePassport } from '../hooks/usePassports';
import { useSearchParams, useRouter } from 'next/navigation';
import { enqueueSnackbar } from 'notistack';

export default function Home() {
  const [username, setUsername] = useState('');

  const [registering, setRegistering] = useState(false);
  const [authenticating, setAuthenticating] = useState(false);
  const [duplicateError, setDuplicateError] = useState(false);

  const endpoint = process.env.NEXT_PUBLIC_ENDPOINT;
  const enclavePublicKey = process.env.NEXT_PUBLIC_ENCLAVE_PUBLIC_KEY;
  const scopeId = process.env.NEXT_PUBLIC_SCOPE_ID;

  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const urlUsername = searchParams.get('username');

    if (urlUsername) {
      setUsername(urlUsername as string);
    }
  }, [searchParams]);

  const { passport } = usePassport({
    ENCLAVE_PUBLIC_KEY: enclavePublicKey!,
    scope_id: scopeId!,
    endpoint: endpoint,
  });

  const userInput = {
    username: username,
    userDisplayName: username,
  };

  async function register() {
    setRegistering(true);

    if (username.trim().length === 0) {
      enqueueSnackbar('Username cannot be empty', { variant: 'error' });
      return;
    }
    setDuplicateError(false);

    try {
      await passport.setupEncryption();
      const res = await passport.register(userInput);

      console.log(res);
      if (res.result.account_id) {
        setRegistering(false);
        setAuthenticating(true);
        await authenticate();
        setAuthenticating(false);
      }
    } catch (error: any) {
      console.error('Error registering:', error);
      if (error.message.includes('Duplicate registration')) {
        await authenticate();
        return;
      }
      enqueueSnackbar(`Error registering: ${error}`, { variant: 'error' });
    } finally {
      setRegistering(false);
    }
  }

  async function authenticate() {
    setAuthenticating(true);
    try {
      await passport.setupEncryption();
      const [_, address] = await passport.authenticate(userInput);

      await fetch('/api/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: username, address: address }),
      });

      const redirectHash = searchParams.get('redirect_hash');
      const redirectUsername = searchParams.get('redirect_username');

      router.push(`https://warpcast.com/${redirectUsername}/${redirectHash}`);
    } catch (error) {
      console.error('Error registering:', error);
    } finally {
      setAuthenticating(false);
    }
  }

  return (
    <main>
      <div className="p-12">
        <h1 className="text-6xl font-bold">Passport Frames</h1>
        <p className="max-w-[40ch] leading-7 mt-8">
          Make a passport wallet with your farcaster account, for a chance to win some $DEGEN
        </p>
        <p className="max-w-[40ch] leading-7 mt-8 italic">
          Disclaimer: These wallets are created on the passport testnet. Please do not send funds
          you are not willing to lose.
        </p>
      </div>

      <div className="flex space-y-5 flex-col items-center max-w-xl mx-auto mt-16">
        <form
          className="flex flex-col items-stretch space-y-8 w-full"
          onSubmit={async (e) => {
            e.preventDefault();
            await register();
          }}
        >
          <div className="flex flex-col items-stretch space-y-8 w-full">
            <div className="flex flex-col items-center space-y-4 w-full">
              <input
                type="text"
                placeholder="Enter a unique username"
                disabled={true}
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                }}
                className={`w-4/6 border border-1 bg-[#161618] ${
                  duplicateError ? 'border-red-600' : 'border-gray-600'
                } focus:outline-black rounded p-3 text-center`}
              />
              {duplicateError && (
                <span className="text-red-600 text-xs">
                  Username already exists, please choose another
                </span>
              )}
              <button
                className="w-4/6 border border-1 rounded p-3 cursor-pointer"
                type="submit"
                disabled={registering || username.length === 0}
              >
                {registering
                  ? 'Registering...'
                  : authenticating
                    ? 'Authenticating...'
                    : ' Register'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
