import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Image, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Divider } from 'react-native-elements';
import * as Localization from 'expo-localization';
import i18n from 'i18n-js';
import { initializeApp } from 'firebase/app';
import { getDatabase, push, ref, onValue } from 'firebase/database';


export default function ListScreen(props) {
  const { finnaImgs } = props.route.params;
  const { navigate } = props.navigation;

  i18n.translations = {
    fi: { alreadyfav: 'Kuva on jo suosikeissa!', newfav: 'Kuva lisätty suosikkeihin!' },
    sv: { alreadyfav: 'Bilden finns redan som favorit!', newfav: "Bilden har sparats till favoriter!" },
    en: { alreadyfav: 'Image is already a favorite!', newfav: 'Image added to favorites!' }
  };
  i18n.locale = Localization.locale;
  i18n.fallbacks = true;

  const firebaseConfig = {
    apiKey: "AIzaSyA1ckOtm8gjvy4Pis9bxJo4lqD18RPIgYI",
    authDomain: "finnamap-73a47.firebaseapp.com",
    databaseURL: "https://finnamap-73a47-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "finnamap-73a47",
    storageBucket: "finnamap-73a47.appspot.com",
    messagingSenderId: "143191252978",
    appId: "1:143191252978:web:40ae5d0d1a48ab5e44956b"
  };
  const app = initializeApp(firebaseConfig);
  const database = getDatabase(app);
  const favRef = ref(database, 'favorites/');

  const [favorites, setFavorites] = useState([]);


  useEffect(() => {
    onValue(favRef, (snapshot) => {
      const data = snapshot.val();
      if (data != null) {
        setFavorites(Object.entries(data));
      } else {
        setFavorites([]);
      }
    });

  }, []);

  const saveFavorite = (id, title) => {
    if (favorites.some(favorite => favorite[1].id === id)) {
      Alert.alert(i18n.t('alreadyfav'));
    } else {
      push(favRef, {
        'id': id,
        'title': title
      });
      Alert.alert(i18n.t('newfav'));
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.listcont}>
        <FlatList
          data={finnaImgs.filter(item => !item.id.includes('siiri'))}
          renderItem={({ item }) => (
            <View>
              <Image style={styles.image} source={{ uri: `https://www.finna.fi/Cover/Show?id=${item.id}&index=0&size=large&source=Solr` }} resizeMode="contain" />
              <Text style={styles.title}>{item.title}</Text>
              <View style={styles.iconView}>
                <Ionicons style={styles.icon} name="heart" size={32} onPress={() => saveFavorite(item.id, item.title)} />
                <Ionicons style={styles.icon} name="information-circle-outline" size={32} onPress={() => navigate('Image', { imageId: item.id })} />
              </View>
              <Divider style={styles.divider} orientation='horizontal' />
            </View>
          )}
          keyExtractor={((item, index) => index.toString())}
        />
      </View>
    </View>
  );

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  divider: {
    margin: 5,
  },
  iconView: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
    marginBottom: 10,
  },
  icon: {
    marginHorizontal: 10,
  },
  image: {
    height: 300,
    width: '95%',
    alignSelf: 'center',
    margin: 10,
  },
  listcont: {
    flex: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    marginBottom: 5,
    alignSelf: 'center'
  },
});