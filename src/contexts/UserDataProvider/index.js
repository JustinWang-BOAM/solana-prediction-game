import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import React, { useEffect, useState } from "react";
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

import { createContext } from "react"; 
import axiosInstance from "../../helpers/axiosInstance";

const UserDataProvider = (props) => {
    const { connected, publicKey } = useWallet();
    const { connection } = useConnection();
    const [betSlip, setBetSlip] = useState(null);
    const [balance, setBalance] = useState(null);
    const [user, setUser] = useState(null);
    const [myBets, setMyBets] = useState(null);

    useEffect(() => {
      const getBalance = async () => {
        return await connection.getBalance(publicKey)
      }

      const addUser = async () => {
        const newUser = {
          address: publicKey.toBase58(),
        }

        return await axiosInstance.post("/api/users/add", newUser);
      }

      const getBets = async (user) => {
          if(!user) return;
          axiosInstance.get(`/api/bets`,{
              user: user._id
          })
          .then(res => res.data)
          .then(data => {
            setMyBets(data);
          })
          .catch(err => {
            console.log("Error occured: " + err.message);
          });
      }

      const getUser = async (address) => {
        const query = {
          address,
        }
        axiosInstance.get(`/api/users/getUser`, query)
        .then(res => res.data)
        .then(async (result) => {
          let loggedInUser = null;
          
          if(!result){
            loggedInUser = await addUser();
          }else{
            loggedInUser = result;
          }

          setUser(loggedInUser);
        })
        .catch(err => {
          console.log("Error occured: " + err.message);
        });
      }

      if (connected) {
        getBalance()
        .then(res => {
          setBalance(res/LAMPORTS_PER_SOL);
        })
        .catch(err => {
          console.log(err);
        });
        getUser(publicKey.toBase58());
        getBets(user);
      } else{
        setBalance(null);
        setUser(null);
      }
    }, [connected, connection, publicKey, user]);


    if(!connected) return (props.children);
    
    return (
        <UserDataContext.Provider value={{
          balance,
          address: publicKey.toBase58(),
          user,
          betSlip, 
          setBetSlip,
          myBets
        }}>
            { props.children }
        </UserDataContext.Provider>
    )
};

export const UserDataContext = createContext({
  balance: null,
  address: null,
  betSlip: null,
  user: null,
  setBetSlip: (betSlip) => {},
  myBets: null,
}); 

export default UserDataProvider;