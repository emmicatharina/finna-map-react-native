import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Image, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Divider } from 'react-native-elements';
import * as Localization from 'expo-localization';
import i18n from 'i18n-js';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, remove, onValue } from 'firebase/database';

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
const favRef = ref(database, 'favorites/')

export default function FavoriteScreen(props) {
  i18n.translations = {
    fi: { deletefav: 'Poistetaanko kuva suosikeista?', delete: 'Poista', cancel: 'Peru', favdeld: 'Kuva poistettu suosikkeihin!' },
    sv: { deletefav: 'Vill du ta bort bilden från favoriter?', delete: 'Ta bort', cancel: 'Ångra', favdeld: "Bilden har tagits bort från favoriter!" },
    en: { deletefav: 'Do you want to remove image from favorites?', delete: 'Remove', cancel: 'Cancel', favdeld: 'Image removed from favorites!' }
  };
  i18n.locale = Localization.locale;
  i18n.fallbacks = true;


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

  const removeFavorite = (key) => {
    Alert.alert(
      i18n.t('deletefav'),
      "",
      [
        {
          text: i18n.t('cancel'),
          onPress: () => {return},
          style: 'cancel',
        },
        {
          text: i18n.t('delete'),
          onPress: () => {
            remove(ref(database, 'favorites/' + key));
            Alert.alert(i18n.t('favdeld'))
          }
        }
      ]
    );

  }

  const { navigate } = props.navigation;

  return (
    <View style={styles.container}>
      <View style={styles.listcont}>
        <FlatList
          data={favorites}
          renderItem={({ item }) => (
            <View>
              <Image style={styles.image} source={{ uri: `https://www.finna.fi/Cover/Show?id=${item[1].id}&index=0&size=large&source=Solr` }} resizeMode="contain" />
              <Text style={styles.title}>{item[1].title}</Text>
              <View style={styles.iconView}>
                <Ionicons style={styles.icon} name="trash-outline" size={32} onPress={() => removeFavorite(item[0])} />
                <Ionicons style={styles.icon} name="information-circle-outline" size={32} onPress={() => navigate('Image', { imageId: item[1].id })} />
              </View>
              <Divider style={styles.divider} orientation='horizontal' />
            </View>
          )}
          keyExtractor={((item, index) => index.toString())}
        />
      </View>
    </View>
  )

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
  },
  icon: {
    marginHorizontal: 10,
  },
  image: {
    height: 250,
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
    alignSelf: 'center',
  },
});