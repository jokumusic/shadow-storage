import React, {createContext, useCallback, useEffect, useRef, useState} from 'react';
import { usePublicKey, useSolanaConnection } from 'react-xnft';
import { Connection, LAMPORTS_PER_SOL, PublicKey, Transaction } from '@solana/web3.js';
import * as anchor from "@project-serum/anchor";
import {ShdwDrive, StorageAccountResponse, ShadowDriveResponse, CreateStorageResponse, ShadowBatchUploadResponse, ListObjectsResponse, StorageAccountInfo} from "@shadow-drive/sdk";

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
    drive: ShdwDrive,
    accounts : StorageAccountResponse[],
    currentAccount: StorageAccountResponse,    
    currentAccountInfo: any,    
    currentAccountFiles: any[],
    refreshBalances() : Promise<void>,
    refreshAccounts(): Promise<StorageAccountResponse[]>,
    selectAccount(StorageAccountResponse) : Promise<void>,
    refreshCurrentAccountFiles(): Promise<string[]>,
    refreshCurrentAccountInfo(): Promise<StorageAccountInfo>,
    refreshCurrentAccountData():Promise<void>,
    createAccount(accountName: string, size: number, unit: string): Promise<CreateStorageResponse>,
    uploadFiles(Files): Promise<ShadowBatchUploadResponse[]>,
    deleteCurrentAccount(): Promise<ShadowDriveResponse>,
    undeleteCurrentAccount() : Promise<ShadowDriveResponse>,
    resizeCurrentAccount(size:number, unit:string) : Promise<ShadowDriveResponse>,
    deleteCurrentAccountFile(fileUrl:string) : Promise<ShadowDriveResponse>,
}

export const STORAGE_UNITS = ["KB", "MB", "GB"];

export const GlobalContext = createContext<GlobalProvider>({});

export function GlobalProvider(props) {
    const connection = useSolanaConnection();
    const wallet = usePublicKey();
    const [solBalance, setSolBalance] = useState(0);
    const [shdwTokenInfo, setShdwTokenInfo] = useState(0);
    const [drive, setDrive] = useState<ShdwDrive>();
    const [accounts, setAccounts] = useState<StorageAccountResponse[]>([]);
    const [currentAccount, setCurrentAccount] = useState<StorageAccountResponse>();
    const [currentAccountInfo, setCurrentAccountInfo] = useState<StorageAccountInfo>();
    const [currentAccountFiles, setCurrentAccountFiles] = useState<string[]>([]);

    useEffect(()=>{
        (async () => {            
            connection.onSignature = async (txid, callback) => {
                const txConfirmation = await connection!.confirmTransaction(txid,'finalized');
                console.log('got confirmation: ', txConfirmation);    
                callback({},confirmation.context)
            };
            connection.getSignatureStatuses = async (signatures: string[], config?:any) => {
                const promises = signatures.map(s=>connection!.confirmTransaction(s,'finalized'));
                const responses = await Promise.all(promises);
                const results = responses.map(r=>({context: r.context, confirmations:20, confirmationStatus:'confirmed' }));
                return {value:results};
            };

            const shdwDrive = await new ShdwDrive(connection,
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

            setDrive(shdwDrive);
        })();

    }, [wallet]);

    useEffect(()=>{
        refreshBalances().catch(err=>console.log(err.toString()));

        const timer = setInterval(()=>{ refreshBalances(); }, 30000);
        return ()=>{
            clearInterval(timer);
        };
    },[]);

    useEffect(()=>{        
        refreshAccounts().catch(err=>console.log(err.toString()));
    },[drive]);

    useEffect(()=>{
        if(!currentAccount && accounts?.length)
            selectAccount(accounts[0]);
    },[accounts]);

    useEffect(()=>{
        refreshCurrentAccountData();
    },[currentAccount]);

    async function refreshCurrentAccountData() {
        refreshCurrentAccountInfo().catch(err=>console.log(err.toString()));
        refreshCurrentAccountFiles().catch(err=>console.log(err.toString()));
    }


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

    async function refreshAccounts() {
        return new Promise<StorageAccountResponse[]>(async (resolve,reject)=>{
            if(!drive){
                reject('drive not initialized');
                return;
            }

            try{
                const accts = await drive.getStorageAccounts("v2")
                    .catch(err=>reject(err));

                if(accts){
                    setAccounts(accts.sort((a,b)=> a?.account?.identifier?.toLowerCase() > b?.account?.identifier?.toLowerCase() ? 1 : -1 ));
                    resolve(accts);
                }
            }catch(err){
                reject(err);
            }
        });
    }
    
    async function selectAccount(account: StorageAccountResponse) {
        setCurrentAccount(account);
    }

    async function refreshCurrentAccountInfo() {
        return new Promise<StorageAccountInfo>(async (resolve,reject)=>{
            if(!currentAccount?.publicKey) {
                reject('current account is not set');
                return;
            }

            const accountInfo = await drive
                .getStorageAccount(new PublicKey(currentAccount.publicKey))
                .catch(err=>reject(err));

            if(accountInfo) {
                setCurrentAccountInfo(accountInfo);
                resolve(accountInfo);
            }
        });
    }

    async function refreshCurrentAccountFiles() {
        return new Promise<string[]>(async (resolve,reject)=>{
            if(!currentAccount?.publicKey) {
                reject('current account is not set');
                return;
            }
                
            const fileGroup = await drive.listObjects(new PublicKey(currentAccount.publicKey))
                .catch(err=>reject(err));

            if(fileGroup) {
                const sortedKeys = fileGroup?.keys?.sort();
                setCurrentAccountFiles(sortedKeys);
                resolve(sortedKeys);
            }
        });
    }

    async function createAccount(accountName: string, size: number, unit: string) {
        return new Promise<CreateStorageResponse>(async (resolve,reject)=>{
            if(!accountName?.trim()){
                reject("a name must be specified");
                return;
            }    
            if(Number.isNaN(size)){
                reject("specified size is not a valid number");
                return;
            }
            if(size <= 0) {
                reject("size must be greater than 0");
                return;
            }    
            if(!STORAGE_UNITS.includes(unit)){
                reject("specified unit size is invalid");
                return;
            }
    
            const sizeParam = `${size}${unit}`;
            const newAcct = await drive
                .createStorageAccount(accountName, sizeParam, "v2")
                .catch(err=>reject(err));

           
            if(!newAcct)
                return;

            const confirmation = await connection.confirmTransaction(newAcct.transaction_signature,'finalized');
            const refreshedAccounts = await refreshAccounts();

            const foundAccount = refreshedAccounts.find(a=>a.publicKey == newAcct.shdw_bucket);           
            if(foundAccount)
                selectAccount(foundAccount);

            resolve(newAcct);
        });
    }

    async function uploadFiles(files) {
        return new Promise<ShadowBatchUploadResponse[]>(async (resolve, reject) =>{
            if(!currentAccount?.publicKey)
            {
            reject("a storage account must be selected first");
            return;
            }
        
            const storageKey = new PublicKey(currentAccount.publicKey);

            const uploads = await drive
            .uploadMultipleFiles(storageKey, files, "v2")
            .catch(err=>reject(err.toString()));
    
            if(!uploads)
                return;
            
            const failures = uploads
                .filter(u=>!u.location)
                .map(f=> `${f.fileName}: ${f.status}`);

            refreshCurrentAccountData();

            if(failures) {
                reject(failures.join(failures));
                return;
            }
            
            resolve(uploads);
        });
    }

    async function deleteCurrentAccount() {
        return new Promise<ShadowDriveResponse>(async (resolve,reject) => {
            if(!currentAccount?.publicKey) {
                reject('you must select an account to delete first.');
                return;
            }
 
            const delAcct = await drive
                .deleteStorageAccount(new PublicKey(currentAccount.publicKey),"v2")
                .catch(err=>reject(err));

            if(!delAcct)
                return;                
            
            refreshCurrentAccountData();
            resolve(delAcct);   
        });
    }

    async function undeleteCurrentAccount() {
        return new Promise<ShadowDriveResponse>(async (resolve,reject)=>{
            if(!currentAccount?.publicKey) {
                reject('you must select an account to un-delete first.');
                return;
            }

            const delAcct = await drive
                .cancelDeleteStorageAccount(new PublicKey(currentAccount.publicKey),"v2")
                .catch(err=>reject(err));

            if(!delAcct)
                return;

            refreshCurrentAccountData();
            resolve(delAcct);
        });
    }

    async function resizeCurrentAccount(size:number, unit:string) {
        return new Promise<ShadowDriveResponse>(async (resolve,reject) =>{
            if(!currentAccountInfo?.storage_account) {
                reject("an account to resize must be selected first");
                return;
            }
            if(Number.isNaN(size)){
                reject("specified size is not a valid number");
                return;
            }
            if(size <= 0) {
                reject("size must be greater than 0");
                return;
            }
            if(!STORAGE_UNITS.includes(unit)){
                reject("specified unit size is invalid");
                return;
            }       

            let multiplier = 0;
            switch(unit) {
                case "KB": multiplier = 1024;
                    break;
                case "MB": multiplier = 1048576;
                    break;
                case "GB": multiplier = 1073741824;
                    break;
                default:
                    reject("Unknown storage unit size");
                    return;
            }

            const byteSize = size * multiplier;
            if(byteSize <= currentAccountInfo.current_usage)
            {
                reject(`${currentAccountInfo.current_usage} bytes are being used on the drive. You can't reduce the size to smaller than this.`);
                return;
            }
            if(byteSize == currentAccountInfo.reserved_bytes) {
                reject(`storage size is already ${currentAccountInfo.reserved_bytes} bytes. Nothing to do`);
                return;
            }

            const pubkey = new PublicKey(currentAccountInfo.storage_account);

            let response;
            if(byteSize < currentAccountInfo.reserved_bytes) {
                const reductionSize = currentAccountInfo.reserved_bytes - byteSize;
                const reductionSizeUnited = byteSizeUnited(reductionSize);
                console.log('ttt reducing drive size by ', reductionSizeUnited);
                response = await drive
                    .reduceStorage(pubkey, reductionSizeUnited, "v2")
                    .catch(err=>reject(err));
            } else {
                const incrementSize = byteSize - currentAccountInfo.reserved_bytes;
                const incrementSizeUnited = byteSizeUnited(incrementSize);
                console.log('ttt incrementing drive size by ', incrementSizeUnited);
                response = await drive
                    .addStorage(pubkey, incrementSizeUnited, "v2")
                    .catch(err=>reject(err));
            }

            if(!response)
                return;
            
            refreshCurrentAccountData();
            resolve(response);
        });
    }

    function byteSizeUnited(n:number) {
        return n < 1024 ? "1KB" 
        : n < 1048576 ? (n/1024).toFixed(0) + "KB"
        : n < 1073741824 ? (n/1048576).toFixed(0) + "MB"
        : (n/1073741824).toFixed(0) + "GB";
    }


    async function deleteCurrentAccountFile(fileUrl:string){
        return new Promise<any>(async (resolve,reject)=>{
            if(!currentAccount?.publicKey) {
                reject('an account must be selected first');
                return;
            }

            const acctPubKey = new PublicKey(currentAccount.publicKey);

            const delFile = await drive
                .deleteFile(acctPubKey,fileUrl,"v2")
                .catch(err=>reject(err));
            
            refreshCurrentAccountData();

            if(!delFile)
                return;
                
            resolve(delFile);
        });
    }

    
    return (
        <GlobalContext.Provider value={{
            connection,
            wallet,
            solBalance,
            shdwTokenInfo,
            drive,
            accounts,
            currentAccount,
            currentAccountInfo,
            currentAccountFiles,
            refreshBalances,
            refreshAccounts,
            selectAccount,
            refreshCurrentAccountFiles,
            refreshCurrentAccountInfo,
            refreshCurrentAccountData,
            createAccount,
            uploadFiles,
            deleteCurrentAccount,
            undeleteCurrentAccount,
            resizeCurrentAccount,
            deleteCurrentAccountFile,
        }}>
            {props.children}
        </GlobalContext.Provider>
    );
}