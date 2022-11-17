import React, { useContext, useState, useEffect } from "react";
import ReactXnft, { Text, View, Button, TextField, Image,
  useConnection, usePublicKey, useNavigation,
} from "react-xnft";
import {GlobalContext} from './GlobalProvider';
import * as styles from "./styles";
import {loadingImgUri} from "./assets";
import {SelectList} from "./components/SelectList";
import {Balance} from "./components/Balance";
import {StorageAccountList} from "./components/StorageAccountList";
import { Connection, LAMPORTS_PER_SOL, PublicKey, Transaction } from '@solana/web3.js';


export function ManageStorageScreen() {
    const globalContext = useContext(GlobalContext);
    const connection = useConnection();
    const wallet = usePublicKey();
    const nav = useNavigation();
    const [message, setMessage] = useState("");
    const [showLoadingImage, setShowLoadingImage] = useState(false);
    const [currentStorageResize, setCurrentStorageResize] = useState(0);

    async function onSelectedAccountChange(accountName:string){
        const foundAccount = globalContext.accounts.find(a=>a.account?.identifier == accountName);
        if(foundAccount) {
            globalContext.selectAccount(foundAccount);           
        }
    }

    async function storageResize() {
        nav.push("create-storage-screen", {isResize: true})
    }

    async function storageDelete() {
        setShowLoadingImage(true);

        const response = await globalContext.deleteCurrentAccount()
            .catch(err=>setMessage(err.toString()));

        if(response)
            setMessage("");

        setShowLoadingImage(false);
    }

    async function storageUnDelete() {
        setShowLoadingImage(true);

        const response = await globalContext.undeleteCurrentAccount()
            .catch(err=>setMessage(err.toString()));
        
        if(response)
            setMessage("");
        
        setShowLoadingImage(false);
    }


    return (
        <View style={styles.baseStyle}>
            <Text style={{color:'red', marginBottom: 10}}>{message}</Text>
            { showLoadingImage &&
                <Image src={loadingImgUri} style={{ alignSelf: 'center'}}/>
            }

            <View style={{width:'100%', display:'flex', flexDirection:'row', alignContent:'flex-end', justifyContent:'flex-end', padding: 5, marginTop:10}}>
                <Button style={{padding:4, marginLeft:5, fontSize: 14}} onClick={()=>nav.push("create-storage-screen")}>Create Storage</Button>
            </View>        

            <View style={{marginTop:10}}>
                { globalContext.accounts?.length &&
                <View style={{display:'flex', flexDirection:'row'}}>
                    <Text style={{marginRight: 7}}>Storage:</Text>
                    <StorageAccountList
                        onChange={(e)=> onSelectedAccountChange(e.target.value)}
                    />
                </View>
                }               
            </View>

            {showLoadingImage ||
                <View style={{display:'flex', flexDirection:'row', alignContent: 'center', alignSelf: 'center', marginTop: 10}}>
                    <Button style={styles.buttonStyle} onClick={()=>storageResize()}>Resize</Button>
                    <Button style={styles.buttonStyle} onClick={()=>globalContext.currentAccountInfo?.to_be_deleted ? storageUnDelete() : storageDelete()}>{globalContext.currentAccountInfo?.to_be_deleted ? "UnDelete" : "Delete"}</Button>
                </View>
            }
            

            <View style={{marginTop: 20, borderWidth:1, borderColor:'white', margin: 2}}>
                <View style={{display:'flex', flexDirection:'row'}}>
                    <Text>Identifier:</Text>
                    <Text style={{color:'yellow', marginLeft:5}}>{globalContext.currentAccountInfo?.identifier}</Text>
                </View>
                <View style={{display:'flex', flexDirection:'row'}}>
                    <Text>PublicKey:</Text>
                    <Text style={{color:'yellow', marginLeft:5, whiteSpace: 'pre-wrap', overflowWrap: 'break-word'}}>{globalContext.currentAccountInfo?.storage_account}</Text>
                </View>
                <View style={{display:'flex', flexDirection:'row'}}>
                    <Text>Files:</Text>
                    <Text style={{color:'yellow', marginLeft:5}}>{(globalContext.currentAccountFiles?.length || 0).toString()}</Text>
                </View>
                <View style={{display:'flex', flexDirection:'row'}}>
                    <Text>Currently Used Bytes:</Text>
                    <Text style={{color:'yellow', marginLeft:5}}> {globalContext.currentAccountInfo?.current_usage?.toString()}</Text>
                </View>
                <View style={{display:'flex', flexDirection:'row'}}>
                    <Text>Reserved Bytes:</Text>
                    <Text style={{color:'yellow', marginLeft:5}}> {globalContext.currentAccountInfo?.reserved_bytes?.toString()}</Text>
                </View>
                <View style={{display:'flex', flexDirection:'row'}}>               
                    <Text>Immutable:</Text>
                    <Text style={{color:'yellow', marginLeft:5}}> {globalContext.currentAccountInfo?.immutable ? 'yes' : 'no'}</Text>
                </View>
                <View style={{display:'flex', flexDirection:'row'}}>
                    <Text>To Be Deleted:</Text>
                    <Text style={{color:'yellow', marginLeft:5}}> {globalContext.currentAccountInfo?.to_be_deleted ? 'yes' : 'no'}</Text>
                </View>
                <View style={{display:'flex', flexDirection:'row'}}>
                    <Text>Creation Epoch:</Text>
                    <Text style={{color:'yellow', marginLeft:5}}> {globalContext.currentAccountInfo?.creation_epoch?.toString()}</Text>
                </View>
                <View style={{display:'flex', flexDirection:'row'}}>
                    <Text>Creation Time:</Text>
                    <Text style={{color:'yellow', marginLeft:5}}> {new Date((globalContext.currentAccountInfo?.creation_time || 0) * 1000).toLocaleString("en-us")}</Text>
                </View>
                <View style={{display:'flex', flexDirection:'row'}}>
                    <Text>Delete Request Epoch:</Text>
                    <Text style={{color:'yellow', marginLeft:5}}>{globalContext.currentAccountInfo?.delete_request_epoch?.toString()}</Text>
                </View>
                <View style={{display:'flex', flexDirection:'row'}}>
                    <Text>Owner1:</Text>
                    <Text style={{color:'yellow', marginLeft:5, whiteSpace: 'pre-wrap', overflowWrap: 'break-word'}}>{globalContext.currentAccountInfo?.owner1}</Text>
                </View>
                <View style={{display:'flex', flexDirection:'row'}}>
                    <Text>Account Counter Seed:</Text>
                    <Text style={{color:'yellow', marginLeft:5}}>{globalContext.currentAccountInfo?.account_counter_seed?.toString()}</Text>
                </View>
                <View style={{display:'flex', flexDirection:'row'}}>
                    <Text>Version:</Text>
                    <Text style={{color:'yellow', marginLeft:5}}>{globalContext.currentAccountInfo?.version}</Text>
                </View>
                <View style={{display:'flex', flexDirection:'row'}}>
                    <Text>Last Fee Epoch:</Text>
                    <Text style={{color:'yellow', marginLeft:5}}>{globalContext.currentAccountInfo?.last_fee_epoch?.toString()}</Text>
                </View>
            </View>

        </View>
    );
}