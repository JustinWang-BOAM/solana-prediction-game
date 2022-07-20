import { Button } from "@chakra-ui/react";
import { useCallback, useState } from "react";
import axiosInstance from "../../helpers/axiosInstance";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletNotConnectedError } from "@solana/wallet-adapter-base";
import { Keypair, LAMPORTS_PER_SOL, SystemProgram, Transaction } from "@solana/web3.js";

export default function CreateBetButton( 
    { 
        predictionId,
        amount,
        address,
        setBetSlip,
        ...props
    }
    ) {
    const [isSaving, setIsSaving] = useState(false);
    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();

    const sendSolana = useCallback(async () => {
        if (!publicKey) throw new WalletNotConnectedError();

        const latestBlockHash = await connection.getLatestBlockhash();

        const transaction = new Transaction({
            feePayer: publicKey,
            blockhash: latestBlockHash.blockhash,
            lastValidBlockHeight: latestBlockHash.lastValidBlockHeight
        });
        console.log(amount)
        transaction.add(
            SystemProgram.transfer({
                fromPubkey: publicKey,
                toPubkey: Keypair.generate().publicKey,
                lamports: amount * LAMPORTS_PER_SOL
            })
        );

        const signature = await sendTransaction(transaction, connection);
        await connection.confirmTransaction({
            blockhash: latestBlockHash.blockhash,
            lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
            signature: signature,
        });

    }, [amount, connection, publicKey, sendTransaction]);

    const createBet = async (event) => {
        event.preventDefault();
        setIsSaving(true);
        await sendSolana();
        const data = {
            user: address,
            predictionId,
            amount,
            status: 'open',
        }

        axiosInstance.post('/addBet', data)
        .then(res => res.data)
        .then(data => {
            setIsSaving(false);
            setBetSlip(null);
            console.log("Bet created");
        })
        .catch(err => {
            setIsSaving(false);
            setBetSlip(null);
            console.log("Error occured: " + err.message);
        });  
    }


    return (
        <Button
            isLoading={isSaving}
            loadingText="Betting..."
            onClick={createBet}
            {...props}
        >
            Make Bet
        </Button>
    );
}