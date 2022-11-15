import React, { useContext, useState, useEffect } from "react";
import ReactXnft, { Text, View, Button, TextField, Image,
  useConnection, usePublicKey, useNavigation,
  BalancesTable, BalancesTableHead, BalancesTableContent, BalancesTableFooter, BalancesTableRow, BalancesTableCell,
  Custom,
} from "react-xnft";
import {GlobalContext} from './GlobalProvider';
import { Connection, LAMPORTS_PER_SOL, PublicKey, Transaction } from '@solana/web3.js';
import {FileInput} from "./components/FileInput";
import {SelectList} from "./components/SelectList";
import * as styles from "./styles";
import {loadingImgUri} from "./assets";


const icon = "https://aux.iconspalace.com/uploads/finder-circle-icon-256.png";

//
// On connection to the host environment, warm the cache.
//
ReactXnft.events.on("connect", () => {
  // no-op
});



export function HomeScreen() {
  const globalContext = useContext(GlobalContext);
  const connection = useConnection();
  const wallet = usePublicKey();
  const nav = useNavigation();
  const [currentStorageAccount, setCurrentStorageAccount] = useState();
  const [currentStorageFiles, setCurrentStorageFiles] = useState([]);
  const [message, setMessage] = useState("");
  const [showLoadingImage, setShowLoadingImage] = useState(false);

  useEffect(()=>{
    if(currentStorageAccount)
      return;

    if(globalContext.shdwAccounts?.length > 0)
      setCurrentStorageAccount(globalContext.shdwAccounts[0]);

  },[globalContext.shdwAccounts]);

  useEffect(()=>{
    console.log('ttt currentStorageAccount change: ', currentStorageAccount);
    if(!currentStorageAccount?.publicKey)
      return;

     (async ()=>{ 
        const fileGroup = await globalContext.shdwDrive.listObjects(new PublicKey(currentStorageAccount.publicKey));
        console.log('ttt fileGroup: ', fileGroup);
        setCurrentStorageFiles(fileGroup.keys);
     })();
     
  },[currentStorageAccount]);

  async function getStorageAccount() {
    const acct = await globalContext.shdwDrive.getStorageAccount(new PublicKey("CQ87QonbT4VWyFZyQVYaHBsvuxc1eeTRUN9gBnZUKoSA"));
    console.log('ttt acct: ', acct);
  }

  async function uploadFiles(files) {
    console.log('ttt in uploadfiles', files);
    if(!currentStorageAccount?.publicKey)
    {
      setMessage("a storage account must be selected first");
      return;
    }

    const storageKey = new PublicKey(currentStorageAccount.publicKey);
    setShowLoadingImage(true);
    const uploads = await globalContext.shdwDrive
      .uploadMultipleFiles(storageKey, files, "v2")
      .catch(err=>setMessage(err.toString()));

    if(uploads) {
      console.log('ttt shdw uploads: ', uploads);
      setMessage("");      
      const fileGroup = await globalContext.shdwDrive
        .listObjects(storageKey)
        .catch(err=>setMessage(err.toString()));
      
      if(fileGroup?.keys)
        setCurrentStorageFiles(fileGroup.keys);
    }

    setShowLoadingImage(false);
  }

  async function listFiles() {
    console.log('shdw accounts: ', globalContext.shdwAccounts);
    const accountPubKey = globalContext.shdwAccounts[0].publicKey;
    console.log('shdw acct pk: ', accountPubKey);
    const listItems = await globalContext.shdwDrive.listObjects(new PublicKey(accountPubKey));
    console.log('shdw filelist: ', listItems);
  }

  async function onSelectedAccountChange(accountName:string){
    console.log('ttt: accountName', accountName);
    const foundAccount = globalContext.shdwAccounts.find(a=>a.account?.identifier == accountName);
    console.log('ttt foundaccount: ', foundAccount);
    if(foundAccount) {
      setCurrentStorageAccount(foundAccount);
    }
  }

  return (
    <View style={styles.baseStyle}>
      <Text style={{color:'red', marginBottom: 10}}>{message}</Text>
      { showLoadingImage &&
          <Image src={loadingImgUri} style={{ alignSelf: 'center'}}/>
      }


      <View style={{display:'flex', flexDirection: 'row', marginBottom: 20}}>
        <View style={{display: 'flex', flexDirection: 'row', marginLeft: 5,}}>
          SOL: 
          <Text style={{marginLeft:2, color:'yellow'}}>{globalContext.solBalance.toFixed(3)}</Text>
        </View>
        <View style={{display: 'flex', flexDirection: 'row', marginLeft: 10,}}>
          SHDW: 
          <Text style={{marginLeft:2, color:'yellow'}}>{(globalContext.shdwTokenInfo?.amount / 1000000000).toFixed(3)}</Text>
        </View>
      </View>

      <View style={{display:'flex', flexDirection:'column', alignContent:'center', alignSelf:'center', justifyContent: 'center', marginLeft: 5}}>
        <View style={{flexDirection: 'row'}}>
          { globalContext.shdwAccounts?.length &&
            <SelectList 
              style={{color:'black'}}
              onChange={(e)=> onSelectedAccountChange(e.target.value)}
              options={
                globalContext.shdwAccounts.map(a=>({
                    label: a.account.identifier,
                    value: a.account.identifier,
                    selected: currentStorageAccount?.account?.identifier == a.account.identifier
                }))
              }
            />
          }
        
          <Button style={styles.buttonStyle} onClick={()=>nav.push("create-storage-screen")}>Create Storage</Button>
        </View>

        <View>
          <FileInput onChange={(e)=>uploadFiles(e.target.files)} multiple={true} />
        </View>
      </View>  
      

      <View style={{marginTop: 20}}>
        <BalancesTable>
          <BalancesTableHead title={`${currentStorageAccount?.account?.identifier} Files`} iconUrl={icon} />
          <BalancesTableContent>
            { currentStorageFiles?.length && 
              currentStorageFiles.map((f,i)=>(
                <BalancesTableRow key={`file_${i}`} onClick={()=>nav.push("file-view-screen", {url:`https://shdw-drive.genesysgo.net/${currentStorageAccount?.publicKey}/${f}`})}>
                  <BalancesTableCell title={f} />
                </BalancesTableRow>
              ))
            }
          </BalancesTableContent>
          <BalancesTableFooter></BalancesTableFooter>
        </BalancesTable>
      </View>
    
    </View>
  );
}


