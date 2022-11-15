import React, { useContext, useState, useEffect } from "react";
import ReactXnft, { Text, View, Button, TextField, Image,
  useConnection, usePublicKey, useNavigation,
} from "react-xnft";
import {GlobalContext} from './GlobalProvider';
import * as styles from './styles';
import {SelectList} from './components/SelectList';
import {loadingImgUri} from "./assets";

const STORAGE_UNITS = ["KB", "MB", "GB"];

const DEFAULT_STORAGE_ACCOUNT_SETTINGS = {
    name: "",
    size: "1",
    unit: "KB",
};



export function CreateStorageScreen({}:any) {
    const nav = useNavigation();
    const globalContext = useContext(GlobalContext);
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
        console.log('ttt sizeparam: ', sizeParam);

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
       
      
    return (
        <View style={{display:'flex', flexDirection:'column', padding:10, alignContent:'center' }}>
            <Text style={{color:'red', marginBottom: 10}}>{message}</Text>
            { showLoadingImage &&
                <Image src={loadingImgUri} style={{ alignSelf: 'center'}}/>
            }

            <View style={styles.inputRowStyle}>
                <Text>Storage Name:</Text>
                <TextField
                    value={newStorageAccountSettings.name}          
                    onChange={(e) =>{setNewStorageAccountSettings({...newStorageAccountSettings, name: e.target.value})}}
                    placeholder={"storage account name"}
                />
            </View>

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
                    <Button style={styles.buttonStyle} onClick={()=>createStorageAccount()}>Submit</Button>
                    <Button style={styles.buttonStyle} onClick={()=>nav.pop()}>Cancel</Button>
                </View>
            }
        </View>
    );
}