import React, { useContext, useState, useEffect } from "react";
import ReactXnft, { Text, View, Button, TextField, Image, useNavigation} from "react-xnft";
import {GlobalContext} from './GlobalProvider';
import {Loading} from "./components/Loading";
import * as styles from "./styles";



export function FileViewScreen(){
    const globalContext = useContext(GlobalContext);
    const nav = useNavigation();
    const [fileName] = useState(nav.activeRoute.props?.fileName);
    const [url] = useState(`https://shdw-drive.genesysgo.net/${globalContext.currentAccount.publicKey}/${fileName}`);
    const [message, setMessage] = useState("");
    const [showLoadingImage, setShowLoadingImage] = useState(false);

    async function deleteFile(){
        setShowLoadingImage(true);
        
        const delFile = await globalContext.deleteCurrentAccountFile(url)
            .catch(err=>setMessage(err.toString()));

        console.log('ttt delFile: ', delFile);

        if(delFile) {
            nav.pop();
        }

        setShowLoadingImage(false);
    }

    return (
        <View>
            <Text style={{color:'red', marginBottom: 10}}>{message}</Text>
            { showLoadingImage &&
                <Loading />
            }

            <View style={{marginTop:20}}>
                <Button style={styles.buttonStyle} onClick={()=>deleteFile()}>Delete</Button>

                <Text style={{marginTop:20, whiteSpace: 'pre-wrap', overflowWrap: 'break-word'}}>URL: {url}</Text>
            </View>            
        </View>
    );
}