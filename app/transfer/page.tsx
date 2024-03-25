'use client';
import { useEffect, useState } from 'react';
import { usePassport } from '../hooks/usePassports';
import { useSearchParams, useRouter } from 'next/navigation';
import { enqueueSnackbar } from 'notistack';
import { createPassportClient } from '@0xpass/passport-viem';
import { base } from 'viem/chains';
import { http, WalletClient } from 'viem';

export default function Home() {
  const [username, setUsername] = useState('');
  const [authenticating, setAuthenticating] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [authenticatedHeader, setAuthenticatedHeader] = useState({});
  const [addressToTransfer, setAddressToTransfer] = useState('');

  const endpoint = process.env.NEXT_PUBLIC_ENDPOINT;
  const enclavePublicKey = process.env.NEXT_PUBLIC_ENCLAVE_PUBLIC_KEY;
  const scopeId = process.env.NEXT_PUBLIC_SCOPE_ID;

  const alchemyUrl = process.env.NEXT_PUBLIC_ALCHEMY_URL;
  const fallbackProvider = http(alchemyUrl);

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

  function createWalletClient() {
    return createPassportClient(authenticatedHeader, fallbackProvider, base, endpoint);
  }

  async function authenticate() {
    setAuthenticating(true);
    try {
      await passport.setupEncryption();
      const [authenticatedHeader, address] = await passport.authenticate(userInput);

      setAuthenticated(true);
      setAuthenticatedHeader(authenticatedHeader);
    } catch (error) {
      console.error('Error authenticating:', error);
      enqueueSnackbar(`Error authenticating: ${error}`, { variant: 'error' });
    } finally {
      setAuthenticating(false);
    }
  }

  async function transferDegen(address: `0x${string}`) {
    const client: WalletClient = createWalletClient();
    const tokenAddress = '0x4ed4e862860bed51a9570b96d89af5e1b0efefed';

    /// 166666666666666666666 / 1e18 = 166
    const amount = '166666666666666666666';

    try {
      const methodSignature = 'a9059cbb'; // 4 bytes of hash "transfer(address,uint256)" function signature

      // pad address and amounts correctly
      const paddedAddress = address.substring(2).padStart(64, '0'); // Remove '0x' and pad
      const paddedAmount = BigInt(amount).toString(16).padStart(64, '0'); // Convert amount to hex and pad

      const data = `0x${methodSignature}${paddedAddress}${paddedAmount}` as `0x${string}`;

      const transaction = await client.prepareTransactionRequest({
        data: data,
        account: address,
        to: tokenAddress,
        chain: base,
      });

      const signedTransaction = await client.signTransaction(transaction);

      const hash = await client.sendRawTransaction({
        serializedTransaction: signedTransaction,
      });

      enqueueSnackbar(`See your transaction on Basescan, https://basescan.org/tx/${hash}`, {
        variant: 'success',
      });
    } catch (error) {
      console.error('Error transferring tokens:', error);
      enqueueSnackbar(`Error transferring tokens: ${error}`, { variant: 'error' });
    }
  }

  return (
    <>
      <div className="p-12">
        <h1 className="text-6xl font-bold">Passport Frames</h1>
        <p className="max-w-[40ch] leading-7 mt-8">Authenticate and claim / transfer your $DEGEN</p>
      </div>

      {authenticated ? (
        <div className="flex space-y-5 flex-col items-center max-w-xl mx-auto mt-16">
          <form
            className="flex flex-col items-stretch space-y-8 w-full"
            onSubmit={async (e) => {
              e.preventDefault();
              await transferDegen(addressToTransfer as `0x${string}`);
            }}
          >
            <div className="flex flex-col items-stretch space-y-8 w-full">
              <div className="flex flex-col items-center space-y-4 w-full">
                <input
                  type="text"
                  placeholder="Address to transfer to"
                  value={addressToTransfer}
                  onChange={(e) => {
                    setAddressToTransfer(e.target.value);
                  }}
                  className={`w-4/6 border border-1 bg-[#161618] focus:outline-black rounded p-3 text-center`}
                />
                <button
                  className="w-4/6 border border-1 rounded p-3 cursor-pointer"
                  type="submit"
                  disabled={authenticating || username.length === 0}
                >
                  Transfer $DEGEN
                </button>
              </div>
            </div>
          </form>
        </div>
      ) : (
        <div className="flex space-y-5 flex-col items-center max-w-xl mx-auto mt-16">
          <form
            className="flex flex-col items-stretch space-y-8 w-full"
            onSubmit={async (e) => {
              e.preventDefault();
              await authenticate();
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
                  className={`w-4/6 border border-1 bg-[#161618] focus:outline-black rounded p-3 text-center`}
                />
                <button
                  className="w-4/6 border border-1 rounded p-3 cursor-pointer"
                  type="submit"
                  disabled={authenticating || username.length === 0}
                >
                  {authenticating ? 'Authenticating...' : ' Authenticate'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
