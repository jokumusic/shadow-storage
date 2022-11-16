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
import {Balance} from "./components/Balance";
import {StorageAccountList} from "./components/StorageAccountList";
import * as styles from "./styles";
import {loadingImgUri, fileListIconUri} from "./assets";


export function HomeScreen() {
  const globalContext = useContext(GlobalContext);
  const connection = useConnection();
  const wallet = usePublicKey();
  const nav = useNavigation();
  const [currentStorageAccount, setCurrentStorageAccount] = useState(nav.activeRoute.props?.storageInfo);
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
      const failures = uploads
        .filter(u=>!u.location)
        .map(f=> `${f.fileName}: ${f.status}`);

      if(failures) {
        setMessage(failures.join(failures));
      } else {
        setMessage("");
      }

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

      <View style={{width:'100%', display:'flex', flexDirection:'row', alignContent:'flex-end', justifyContent:'space-between', padding: 5}}>
      { globalContext.shdwAccounts?.length &&
        
          <View style={{display:'flex', flexDirection:'row'}}>
            <Text style={{marginRight:5}}>Storage:</Text>
            <StorageAccountList
              style={{fontSize: 14, padding:5, color:'black', height: 30, marginRight:5}}
              onChange={(e)=> onSelectedAccountChange(e.target.value)}
              selector={(a)=>currentStorageAccount?.account?.identifier == a.account.identifier}
            />
          </View>
        }

        <Button
          style={{padding:4, marginLeft:5, fontSize: 14}}
          onClick={()=>nav.push("manage-storage-screen", {storageAccount: currentStorageAccount})}
        >
          Manage Storage
        </Button>        

      </View>

      <View style={{marginLeft:10, marginTop: 20}}>
        <FileInput onChange={(e)=>uploadFiles(e.target.files)} multiple={true} />
      </View>  


      <View style={{marginTop: 20}}>
        <BalancesTable>
          <BalancesTableHead title={`${currentStorageAccount?.account?.identifier} Files`} iconUrl={fileListIconUri} />
          <BalancesTableContent>
            { currentStorageFiles?.length && 
              currentStorageFiles.map((f,i)=>(
                <BalancesTableRow
                  key={`file_${i}`}
                  onClick={()=> nav.push("file-view-screen", {
                      fileName: f,
                      accountKey: currentStorageAccount.publicKey,
                    })
                  }
                >
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


