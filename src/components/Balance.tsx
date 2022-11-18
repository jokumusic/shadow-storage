import React,{useContext} from "react";
import { View, Text} from "react-xnft";
import {GlobalContext} from '../GlobalProvider';

export function Balance(){
    const globalContext = useContext(GlobalContext);

    return (
        <View style={{display:'flex', flexDirection: 'row', marginBottom: 20}}>
            <View style={{display: 'flex', flexDirection: 'row', marginLeft: 5,}}>
                <Text>SOL:</Text>
                <Text style={{marginLeft:2, color:'gray'}}>{(globalContext.solBalance || 0).toFixed(3)}</Text>
            </View>
            <View style={{display: 'flex', flexDirection: 'row', marginLeft: 10,}}>
                <Text>SHDW:</Text>
                <Text style={{marginLeft:2, color:'gray'}}>{((globalContext.shdwTokenInfo?.amount || 0) / 1000000000).toFixed(3)}</Text>
            </View>
        </View>
    );
}