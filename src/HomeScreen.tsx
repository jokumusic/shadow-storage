import React, { useContext, useState, useEffect } from "react";
import ReactXnft, { Text, View, Button, Image,
  useConnection, usePublicKey, useNavigation,
  BalancesTable, BalancesTableHead, BalancesTableContent, BalancesTableFooter, BalancesTableRow, BalancesTableCell,
} from "react-xnft";
import {GlobalContext} from './GlobalProvider';
import {FileInput} from "./components/FileInput";
import {StorageAccountList} from "./components/StorageAccountList";
import * as styles from "./styles";
import {fileListIconUri} from "./assets";
import {Loading} from "./components/Loading";


export function HomeScreen() {
  const globalContext = useContext(GlobalContext);
  const connection = useConnection();
  const wallet = usePublicKey();
  const nav = useNavigation();
  const [message, setMessage] = useState("");
  const [showLoadingImage, setShowLoadingImage] = useState(false);

  async function uploadFiles(files) {
    setShowLoadingImage(true);

    await globalContext
      .uploadFiles(files)
      .catch(err=>setMessage(err.toString()));

    setShowLoadingImage(false);
  }

  async function onSelectedAccountChange(accountName:string){
    const foundAccount = globalContext.accounts.find(a=>a.account?.identifier == accountName);
    if(foundAccount) {
      globalContext.selectAccount(foundAccount);
    } else {
      setMessage(`couldn't find ${accountName} account.`);
    }
  }

  return (
    <View style={styles.baseStyle}>

      <Text style={{color:'red', marginBottom: 10}}>{message}</Text>
      { (showLoadingImage || globalContext.accounts == undefined) &&
          <Loading />
      }

      <View style={{width:'100%', display:'flex', flexDirection:'row', alignContent:'flex-end', justifyContent:'space-between', padding: 5}}>
      { globalContext.accounts?.length > 0 &&
        
        <View style={{display:'flex', flexDirection:'row'}}>
          <Text style={{marginRight:5, alignSelf:'center'}}>Storage:</Text>
          <StorageAccountList
            style={{fontSize: 14, padding:5, color:'black', height: 30, marginRight:5, alignSelf:'center'}}
            onChange={(e)=> onSelectedAccountChange(e.target.value)}
          />
        </View>
      }

        <Button style={styles.powerButtonStyle} onClick={()=>nav.push("manage-storage-screen")}>
          Manage Storage
        </Button>        

      </View>

    {globalContext.currentAccount?.publicKey &&
    <>
      { globalContext.currentAccountInfo?.immutable ?
        <Text style={{color:'red'}}>This storage is marked as immutable and cannot be modified.</Text>
        :
        <View style={{marginLeft:10, marginTop: 20}}>
          <FileInput onChange={(e)=>uploadFiles(e.target.files)} multiple={true} />
        </View>
      }

      <View style={{display: 'flex', flexDirection:'row', marginTop: 30, paddingLeft:15, fontSize:10, alignSelf:'center'}}>
        <Text>{`${((globalContext.currentAccountInfo?.reserved_bytes || 0) - (globalContext.currentAccountInfo?.current_usage || 0)).toLocaleString("en-US")} bytes remaining`}</Text>
        {globalContext.currentAccountInfo?.to_be_deleted &&
          <Text style={{color:'red',marginLeft:10}}>(is pending deletion)</Text>
        }
      </View>
      <View style={{marginTop: 5}}>
        <BalancesTable>
          <BalancesTableHead title={`${globalContext.currentAccount?.account?.identifier} files (${globalContext.currentAccountFiles?.length})`} iconUrl={fileListIconUri} />
          <BalancesTableContent>
            { globalContext.currentAccountFiles?.length && 
              globalContext.currentAccountFiles.map((f,i)=>(
                <BalancesTableRow
                  key={`file_${i}`}
                  style={{height:40}}
                  onClick={()=> nav.push("file-view-screen", {fileName: f}) }
                >
                  <BalancesTableCell title={f} />
                </BalancesTableRow>
              ))
            }
          </BalancesTableContent>
          <BalancesTableFooter></BalancesTableFooter>
        </BalancesTable>
      </View>
    </> 
    } 

    </View>
  );
}


