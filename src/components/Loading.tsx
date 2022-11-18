import {Image, View} from "react-xnft";
import {loadingImgUri} from "../assets";

export function Loading() { 
    return (
        <View style={{display:'flex', alignSelf:'center', justifyContent:'center'}}>
            <Image src={loadingImgUri} />
        </View>
    );
}