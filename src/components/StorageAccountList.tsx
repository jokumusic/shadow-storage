import React, {useContext} from "react";
import {GlobalContext} from '../GlobalProvider';
import {SelectList} from "./SelectList";


export interface StorageAccountListProps {
    onChange: (Event)=>void,
    style?: React.CSSProperties,
}

export function StorageAccountList(props: StorageAccountListProps) {
    const globalContext = useContext(GlobalContext);

    return (
        <SelectList 
            style={props.style ?? {color:'black'}}
            onChange={props.onChange}
            options={
                globalContext.accounts.map(a=>({
                    label: a.account.identifier,
                    value: a.account.identifier,
                    selected: globalContext.currentAccount?.account?.identifier == a.account.identifier,
                }))
            }
        />
    );
}