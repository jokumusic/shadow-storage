import React, { useContext, useState, useEffect, useRef } from "react";
import ReactXnft, { Text, View, Button, TextField, Image,
  useConnection, usePublicKey, useNavigation,
} from "react-xnft";
import {GlobalContext} from './GlobalProvider';
import * as styles from './styles';
import {SelectList} from './components/SelectList';
import {loadingImgUri} from "./assets";
import { Connection, LAMPORTS_PER_SOL, PublicKey, Transaction } from '@solana/web3.js';

const STORAGE_UNITS = ["KB", "MB", "GB"];

const DEFAULT_STORAGE_ACCOUNT_SETTINGS = {
    name: "",
    size: "1",
    unit: "KB",
};



export function CreateStorageScreen() {
    const nav = useNavigation();
    const globalContext = useContext(GlobalContext);
    const [isResize] = useState(nav.activeRoute.props?.isResize ? true : false);
    const [storageInfo] = useState(nav.activeRoute.props?.storageInfo);
    const [newStorageAccountSettings, setNewStorageAccountSettings] = useState(DEFAULT_STORAGE_ACCOUNT_SETTINGS);
    const [message, setMessage] = useState("");
    const [showLoadingImage, setShowLoadingImage] = useState(false);    

    
    async function createStorageAccount() {
        if(!newStorageAccountSettings.name){
            setMessage("a name must be specified");
            return;
        }

        const size = Number(newStorageAccountSettings.size);
        if(Number.isNaN(size)){
            setMessage("specified size is not a valid number");
            return;
        }
        if(size <= 0) {
            setMessage("size must be greater than 0");
            return;
        }

        if(!STORAGE_UNITS.includes(newStorageAccountSettings.unit)){
            setMessage("specified unit size is invalid");
            return;
        }

        const sizeParam = `${size}${newStorageAccountSettings.unit}`;

        setShowLoadingImage(true);
        const newAcct = await globalContext.shdwDrive
            .createStorageAccount(newStorageAccountSettings.name, sizeParam, "v2")
            .catch(err=>setMessage(err.toString()));

        if(newAcct) {
            console.log('ttt newAcct: ', newAcct);
            globalContext.refreshShdwAccounts();
            nav.pop();
        }

        setShowLoadingImage(false);
    }

    async function resizeStorageAccount() {

        if(!isResize)
        {
            setMessage("This screen is not currently configured for resizing");
            return;
        }

        if(!storageInfo?.storage_account) {
            setMessage("Missing storage account info. Try leaving this screen and coming back.");
            return;
        }

        const size = Number(newStorageAccountSettings.size);
        if(Number.isNaN(size)){
            setMessage("specified size is not a valid number");
            return;
        }
        if(size <= 0) {
            setMessage("size must be greater than 0");
            return;
        }

        if(!STORAGE_UNITS.includes(newStorageAccountSettings.unit)){
            setMessage("specified unit size is invalid");
            return;
        }       

        let multiplier = 0;
        switch(newStorageAccountSettings.unit) {
            case "KB": multiplier = 1024;
                break;
            case "MB": multiplier = 1048576;
                break;
            case "GB": multiplier = 1073741824;
                break;
            default:
                setMessage("Unknown storage unit size");
                return;
        }

        const byteSize = size * multiplier;
        if(byteSize <= storageInfo.current_usage)
        {
            setMessage(`${storageInfo.current_usage} bytes are being used on the drive. You can't reduce the size to smaller than this.`);
            return;
        }
        if(byteSize == storageInfo.reserved_bytes) {
            setMessage(`storage size is already ${storageInfo.reserved_bytes} bytes. Nothing to do`);
            return;
        }

        const pubkey = new PublicKey(storageInfo.storage_account);     
            
        setShowLoadingImage(true);

        let response;
        if(byteSize < storageInfo.reserved_bytes) {
            const reductionSize = storageInfo.reserved_bytes - byteSize;
            const reductionSizeUnited = byteSizeUnited(reductionSize);
            console.log('ttt reducing drive size by ', reductionSizeUnited);
            response = await globalContext.shdwDrive
                .reduceStorage(pubkey, reductionSizeUnited, "v2")
                .catch(err=>setMessage(err.toString()));
        } else {
            const incrementSize = byteSize - storageInfo.reserved_bytes;
            const incrementSizeUnited = byteSizeUnited(incrementSize);
            console.log('ttt incrementing drive size by ', incrementSizeUnited);
            response = await globalContext.shdwDrive
                .addStorage(pubkey, incrementSizeUnited, "v2")
                .catch(err=>setMessage(err.toString()));
        }

        if(response)
            nav.pop();
        
        setShowLoadingImage(false);        
    }

    function byteSizeUnited(n:number) {
        return n < 1024 ? "1KB" 
        : n < 1048576 ? (n/1024).toFixed(0) + "KB"
        : n < 1073741824 ? (n/1048576).toFixed(0) + "MB"
        : (n/1073741824).toFixed(0) + "GB";
    }
       
      
    return (
        <View style={{display:'flex', flexDirection:'column', padding:10, alignContent:'center' }}>
            <Text style={{color:'red', marginBottom: 10}}>{message}</Text>
            { showLoadingImage &&
                <Image src={loadingImgUri} style={{ alignSelf: 'center'}}/>
            }

            {isResize ||
                <View style={styles.inputRowStyle}>
                    <Text>Storage Name:</Text>
                    <TextField
                        value={newStorageAccountSettings.name}          
                        onChange={(e) =>{setNewStorageAccountSettings({...newStorageAccountSettings, name: e.target.value})}}
                        placeholder={"storage account name"}                    
                    />
                </View>
            }   

            <View style={styles.inputRowStyle}>
                <Text>Storage Size:</Text>
                <View style={{display:'flex', flexDirection:'row'}}>
                    <TextField
                        value={newStorageAccountSettings.size}          
                        onChange={(e) =>{setNewStorageAccountSettings({...newStorageAccountSettings, size: e.target.value})}}
                        placeholder={"storage account size"}
                    />
                    <SelectList
                        style={{color: 'black', marginLeft: 5}}
                        onChange={(e)=>{setNewStorageAccountSettings({...newStorageAccountSettings, unit: e.target.value})}}
                        options={STORAGE_UNITS.map(u=>({
                            label:u,
                            value:u,
                        })) 
                        }
                    />
                </View>
            </View>

            {showLoadingImage ||
                <View style={{display:'flex', flexDirection:'row', alignContent:'center', alignSelf:'center', justifyContent: 'center', marginTop: 10}}>
                    <Button style={styles.buttonStyle} onClick={()=> isResize ? resizeStorageAccount() : createStorageAccount()}>{isResize ? "Resize" : "Create"}</Button>
                    <Button style={styles.buttonStyle} onClick={()=>nav.pop()}>Cancel</Button>
                </View>
            }
        </View>
    );
}