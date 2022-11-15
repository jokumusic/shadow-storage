import React, { useContext, useState, useEffect } from "react";
import ReactXnft, { Text, View, Button, TextField,
  useConnection, usePublicKey, useNavigation,
  BalancesTable, BalancesTableHead, BalancesTableContent, BalancesTableFooter, BalancesTableRow, BalancesTableCell,
  Custom, Iframe
} from "react-xnft";


export function FileViewScreen(){
    const nav = useNavigation();
    const [url] = useState(nav.activeRoute.props?.url);

    return (
        <View>
            <Text style={{whiteSpace: 'pre-wrap', overflowWrap: 'break-word'}}>URL: {url}</Text>  
        </View>
    );
}