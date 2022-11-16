import React, { useContext, useState, useEffect, useRef } from "react";
import ReactXnft, { Text, View, Button, TextField, Image,
  useConnection, usePublicKey, useNavigation,
} from "react-xnft";
import {GlobalContext, STORAGE_UNITS} from './GlobalProvider';
import * as styles from './styles';
import {SelectList} from './components/SelectList';
import {loadingImgUri} from "./assets";
import { Connection, LAMPORTS_PER_SOL, PublicKey, Transaction } from '@solana/web3.js';

const DEFAULT_STORAGE_ACCOUNT_SETTINGS = {
    name: "",
    size: "1",
    unit: "KB",
};



export function CreateStorageScreen() {
    const nav = useNavigation();
    const globalContext = useContext(GlobalContext);
    const [isResize] = useState(nav.activeRoute.props?.isResize ? true : false);
    const [newStorageAccountSettings, setNewStorageAccountSettings] = useState(DEFAULT_STORAGE_ACCOUNT_SETTINGS);
    const [message, setMessage] = useState("");
    const [showLoadingImage, setShowLoadingImage] = useState(false);    

    
    async function createStorageAccount() {
        setShowLoadingImage(true);

        const newAcct = await globalContext.createAccount(newStorageAccountSettings.name, newStorageAccountSettings.size, newStorageAccountSettings.unit)
            .catch(err=>setMessage(err.toString()));

        if(newAcct) {
            console.log('ttt newAcct: ', newAcct);
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
            
        setShowLoadingImage(true);

        const response = await globalContext.resizeCurrentAccount(newStorageAccountSettings.size, newStorageAccountSettings.unit)
            .catch(err=>setMessage(err.toString()));

        if(response) {
            console.log('ttt resize response: ', response);
            nav.pop();
        }
        
        setShowLoadingImage(false);        
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