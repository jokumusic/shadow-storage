import React, {createContext, useCallback, useEffect, useRef, useState} from 'react';
import { usePublicKey, useSolanaConnection } from 'react-xnft';
import { Connection, LAMPORTS_PER_SOL, PublicKey, Transaction } from '@solana/web3.js';
import * as anchor from "@project-serum/anchor";
import {ShdwDrive, StorageAccountResponse} from "@shadow-drive/sdk";

export interface TokenInfo {
    readonly amount: number,
    readonly authority: any,
    readonly key: any,
    readonly mint: any,
}

export interface GlobalProvider {
    connection: Connection,
    wallet: PublicKey,
    solBalance: number,
    shdwTokenInfo : TokenInfo,
    shdwDrive: ShdwDrive,
    refreshBalances() : Promise<void>,
    refreshShdwAccounts(): Promise<void>,
    refreshShdwFiles(): Promise<void>,
    shdwAccounts : StorageAccountResponse[],
    shdwFiles: any[],
}


export const GlobalContext = createContext<GlobalProvider>({});

export function GlobalProvider(props) {
    const connection = useSolanaConnection();
    const wallet = usePublicKey();
    const [solBalance, setSolBalance] = useState(0);
    const [shdwTokenInfo, setShdwTokenInfo] = useState(0);
    const [shdwDrive, setShdwDrive] = useState<ShdwDrive>();
    const [shdwAccounts, setShdwAccounts] = useState<StorageAccountResponse[]>([]);
    const [shdwFiles, setShdwFiles] = useState([]);

    async function refreshBalances () {
        const solBalance = await connection.getBalance(wallet) / LAMPORTS_PER_SOL;
        setSolBalance(solBalance);

        const tokenData = await connection.customSplTokenAccounts(wallet);
        const shadowTokens = tokenData?.tokenAccountsMap
            ?.map(a=>{
                if(a?.length < 2)
                    return null;
                
                return a[1];
            })
            ?.filter(a=> a?.mint == "SHDWyBxihqiCj6YekG2GUr7wqKLeLAMK1gHZck9pL6y");
        
        if(shadowTokens?.length > 0) {
            setShdwTokenInfo(shadowTokens[0]);
            //console.log('shdwtoken: ', shadowTokens[0]);
        }
    }

    useEffect(()=>{
        refreshBalances();
        const timer = setInterval(()=>{ refreshBalances(); }, 30000);
        return ()=>{
            clearInterval(timer);
        };
    },[]);
    

    useEffect(()=>{
        (async () => {            
            const drive = await new ShdwDrive(connection,
            {                    
                signTransaction: async (tx: Transaction) => {
                    return window.xnft.solana.signTransaction(tx);
                },
                signAllTransactions: async (txs: Transaction[])=>{
                    return window.xnft.solana.signAllTransactions(txs);
                },
                signMessage(msg) {
                    return window.xnft.solana.signMessage(msg);
                },
                publicKey: wallet,
            })
            .init();
            
            setShdwDrive(drive);
        })();

    }, [wallet]);


    async function refreshShdwAccounts() {
        const accts = await shdwDrive?.getStorageAccounts("v2");
        setShdwAccounts(accts);
        console.log('shdw accts: ', accts);
    }

    useEffect(()=>{        
        refreshShdwAccounts();
    },[shdwDrive]);

    async function refreshShdwFiles() {
        if(!shdwAccounts?.length) 
            return;
            
        const promises = shdwAccounts.map(a=>{
           return shdwDrive.listObjects(new PublicKey(a.publicKey));
        });

        const fileGroups = await Promise.all(promises);
        const files = fileGroups?
        .filter(g=>g.keys?.length)?
        .map(g=>g.keys)?
        .flat();
        
        console.log('shdw files: ', files);
        if(files)
            setShdwFiles(files);
    }

    useEffect(()=>{
        refreshShdwFiles();
    },[shdwAccounts]);


  
    return (
        <GlobalContext.Provider value={{
            connection,
            wallet,
            solBalance,
            shdwTokenInfo,
            shdwDrive,
            shdwAccounts,
            shdwFiles,
            refreshBalances,
            refreshShdwAccounts,
            refreshShdwFiles,            
        }}>
            {props.children}
        </GlobalContext.Provider>
    );
}