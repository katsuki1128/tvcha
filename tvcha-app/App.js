import {
  StyleSheet,
  Text,
  View,
  StatusBar,
  Image,
  Button,
  TouchableOpacity,
  TextInput,
  FlatList,
  SafeAreaView,
  Alert,
} from 'react-native';

import React, { useState, useEffect } from 'react';

import "firebase/firestore";
import { initializeApp } from "firebase/app";

import {
  getFirestore,
  collection,
  getDoc,
  doc,
  query,
  orderBy,
  updateDoc,
  onSnapshot,
} from "firebase/firestore";
  
import { getStorage, ref } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBs-rcINsUSZe7bD7OeLTrNcXm6-OInABg",
  authDomain: "tvcha-9cae7.firebaseapp.com",
  projectId: "tvcha-9cae7",
  storageBucket: "tvcha-9cae7.appspot.com",
  messagingSenderId: "866848033597",
  appId: "1:866848033597:web:c6887382eb14ee58351354"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ストレージにアクセスするための接続情報を取得
const storage = getStorage(app);
// ストレージサービスからストレージ参照を作成する
const storageRef = ref(storage);

//----------------------------------------
// ▼firebaseから読み込んで画面に表示する
//----------------------------------------

// ⭐️stampListという空の配列を作り、今後setStampListメソッドで
// 更新していくことをuseState([])で定義
const App = () => {
    const [stampList, setStampList] = useState([]);
    const [userList, setUserList] = useState([]);

  // ⭐️初回読み込み時のみスタンプリストを読み込む
  useEffect(() => {
    const q = query(collection(db, "tvcha"), orderBy("order", "asc")); // orderの値で降順にソートするクエリを作成
    onSnapshot(q, (querySnapshot) => {
      const newStampList = querySnapshot.docs.map((doc) => {
        const { img, point, count, order } = doc.data();
        return {
          id: doc.id,
          img,
          point,
          count,
          order,
        };
      });
      setStampList(newStampList);
    });
  }, []);

  // ⭐️初回読み込み時のみユーザー情報を読み込む
  useEffect(() => {
    onSnapshot(collection(db, "tvcha-user"), (querySnapshot) => {
      const newUserList = querySnapshot.docs.map((doc) => {
        const { user, point } = doc.data();
        return {
          id: doc.id,
          user,
          point,
        };
      });
      setUserList(newUserList);
    });
  }, []);
    
  //----------------------------------------
  // スタンプをスクロールするための準備
  //----------------------------------------
  const renderStampItem = ({ item, index }) => (
    <TouchableOpacity
      key={index} // ここで一意のkeyを設定する
      style={styles.stampContainer}
      onPress={() => handleItemClick(item, "tvcha", item.id, "tvcha-user", userList[0].id)}
    >
      <Image style={styles.image} source={{ uri: item.img }} />
      <Text style={[styles.text, { textAlign: 'center' }]}>
        {item.point}
      </Text>
    </TouchableOpacity>
  );

    
  //----------------------------------------
  // ▼画面描画内容
  //----------------------------------------
    
    return (  
      <SafeAreaView style={[styles.container]}>
        <Text style={{ fontSize: 36 }}>👇テレビをスマホに配信👇</Text>
          <Image
            style={styles.imagetv}
            source={require('./Sequence04.gif')} />

        <Text style={{ fontSize: 36 }}>👇スタンプエリア</Text>
          <View style={{ flex: 1 }}>
          <FlatList
            style={[styles.stampsContainer]}
            data={stampList}
            renderItem={renderStampItem}
            keyExtractor={(item, index) => index.toString()}
            numColumns={4}
          />
          </View>


        <Text style={{ fontSize: 36 }}>👇持ちポイント</Text>
        <View>
          <Text style={{ fontSize: 48 }}>
            {userList.length > 0 ? userList[0].point : ''}
          </Text>
        </View>
        
       <StatusBar style="auto" />

      </SafeAreaView>
    );
};

//----------------------------------------
// ▼firebaseに押された数を保存する
//----------------------------------------

const handleItemClick = async (data, collection1, docId1, collection2, docId2) => {
  try {
    const currentCount = data.count;
    const consumptionPoint = data.point;

    const updatedCount = currentCount + 1;

    // Firestoreのドキュメントを更新
    await updateDoc(doc(db, collection1, docId1), {
      count: updatedCount
    });

    // Firestoreからcollection2とdocId2で指定されるドキュメントを取得
    const docSnapshot = await getDoc(doc(db, collection2, docId2));
    if (docSnapshot.exists()) {
      const { point } = docSnapshot.data();

      // ドキュメントのpointを使用して更新
      await updateDoc(doc(db, collection2, docId2), {
        point: point - consumptionPoint
      });

      console.log("カウントが正常に更新されました。");
    } else {
      console.log("指定されたドキュメントが存在しません。");
    }
  } catch (error) {
    console.error("カウントの更新中にエラーが発生しました:", error);
  }
};






//----------------------------------------
// ▼styleを設定する
//----------------------------------------


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 18,
  },
  flatListContent: {
    padding: 10,
  },
  imagetv: {
    width: 480,
    height: 240,
  },
  image: {
    width: 80,
    height: 80,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  stampContainer: {
    // margin: 10,    
    width: '25%', // 1行に4つのスタンプなので、横幅を適切に設定
    marginBottom: 10,
    alignItems: 'center',
  },
  stampsContainer: {
    height: 200,
  },
});

export default App;

