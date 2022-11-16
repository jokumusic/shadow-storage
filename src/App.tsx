import React, { useContext } from "react";
import { Stack, View } from "react-xnft";
import { GlobalContext } from "./GlobalProvider";
import {HomeScreen} from "./HomeScreen";
import {CreateStorageScreen} from "./CreateStorageScreen";
import {FileViewScreen} from "./FileViewScreen";
import {ManageStorageScreen} from "./ManageStorageScreen";
import {TestScreen} from "./TestScreen";


export function App() {
    const globalContext = useContext(GlobalContext);

    return (
    <View style={{ background: "black", height: "100%" }}>
      <Stack.Navigator
        initialRoute={{ name: "home-screen" }}
        style={{
          display: "flex",
          justifyContent: "center",
          alignContent: 'center',
        }}
        titleStyle={{display: 'flex', justifyContent: 'start', fontSize: 18}}
        options={
          ({ route }) => {
          switch (route.name) {
            case "home-screen":
              return {
                title:"",
              };
            case "create-storage-screen":
              return {
                title: "",
              };
            case "file-view-screen":
              return {
                title: "",
              };
            case "manage-storage-screen":
              return {
                title: "",
              };            
            case "test-screen":
              return {
                title: "test",
              }
            default:
              throw new Error("unknown route");
          }
        }}
      >
        <Stack.Screen
          name={"home-screen"}
          component={(props: any) => <HomeScreen {...props} />}
        />
        <Stack.Screen
          name={"create-storage-screen"}
          component={(props: any) => <CreateStorageScreen {...props} />}
        />
         <Stack.Screen
          name={"file-view-screen"}
          component={(props: any) => <FileViewScreen {...props} />}
        />
        <Stack.Screen
          name={"manage-storage-screen"}
          component={(props: any) => <ManageStorageScreen {...props} />}
        />
         <Stack.Screen
          name={"test-screen"}
          component={(props: any) => <TestScreen {...props} />}
        />

      </Stack.Navigator>
    </View>
  );
}
