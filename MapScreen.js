import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { Alert, Image, Keyboard, KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import MapView, { Callout, Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import * as Localization from 'expo-localization';
import i18n from 'i18n-js';
import { useHeaderHeight } from '@react-navigation/elements';
import { Header, Input } from 'react-native-elements';
import { initializeApp } from 'firebase/app';
import { getDatabase, push, ref, onValue } from 'firebase/database';
import { Divider } from 'react-native-elements/dist/divider/Divider';

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
  
export default function MapScreen(props) {

  const [address, setAddress] = useState('');
  const [region, setRegion] = useState({
    latitude: 60.16755,
    longitude: 24.94196,
    latitudeDelta: 0.0222,
    longitudeDelta: 0.0121,
  });
  const [currentLocation, setCurrentLocation] = useState({
    latitude: 0.00000,
    longitude: 0.00000,
  });
  const [finnaImgs, setFinnaImgs] = useState([]);
  const [favorites, setFavorites] = useState([]);

  const headerHeight = useHeaderHeight();

  i18n.translations = {
    fi: { locationnoperm: 'Et ole antanut lupaa käyttää sijantia.', error: 'Tapahtui virhe', alreadyfav: 'Kuva on jo suosikeissa!', newfav: 'Kuva lisätty suosikkeihin!', address: 'Hae osoitteella' },
    sv: { locationnoperm: 'Du har inte gett tillstånd att använda position.', error: 'Något dick fel', alreadyfav: 'Bilden finns redan som favorit!', newfav: "Bilden har sparats till favoriter!", address: 'Sök adress' },
    en: { locationnoperm: 'No permission to get location.', error: 'Something went wrong', alreadyfav: 'Image is already a favorite!', newfav: 'Image added to favorites!', address: 'Search address' }
  };
  i18n.locale = Localization.locale;
  i18n.fallbacks = true;




  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(i18n.t('locationnoperm'))
        return;
      }
      let userLocation = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
      setCurrentLocation({
        latitude: userLocation.coords.latitude,
        longitude: userLocation.coords.longitude,
      });
      setRegion({
        ...region,
        latitude: userLocation.coords.latitude,
        longitude: userLocation.coords.longitude,
      });
      getFinnaImgs(userLocation.coords.latitude, userLocation.coords.longitude)
    })();

    onValue(favRef, (snapshot) => {
      const data = snapshot.val();
      if (data != null) {
        setFavorites(Object.entries(data));
      } else {
        setFavorites([]);
      }
    });

  }, []);

  const getAddressCoords = () => {
    if (address) {
      const url = 'http://www.mapquestapi.com/geocoding/v1/address?key=G7MFdVqwZaveTGMxPgAmYlVyDfgXSlwj&location=' + address + ", Helsinki";
      fetch(url)
        .then(response => response.json())
        .then(responseData => {
          const lat = responseData.results[0].locations[0].latLng.lat;
          const lng = responseData.results[0].locations[0].latLng.lng;
          setRegion({
            ...region,
            latitude: lat,
            longitude: lng
          });
          getFinnaImgs(lat, lng);
        })
        .catch(error => Alert.alert(i18n.t('error'), error));
    }
  }

  const getFinnaImgs = (lat, lng) => {
    fetch(`https://api.finna.fi/v1/search?type=AllFields&limit=100&view=grid&filter%5B%5D=~format%3A%220%2FImage%2F%22&filter%5B%5D=~format%3A%220%2FPlace%2F%22&filter%5B%5D=online_boolean%3A%221%22&filter%5B%5D=%7B!geofilt+sfield%3Dlocation_geo+pt%3D${lat}%2C${lng}+d%3D1.0%7D&prettyPrint=true&field%5B%5D=id&field%5B%5D=title&field%5B%5D=geoLocations`)
      .then(response => response.json())
      .then(responseData => setFinnaImgs(responseData.records))
  }

  const checkIfNoImgs = (resultCount) => {
    if (resultCount == 0) {
      Alert.alert('Ei kuvia')
    }
  }

  const saveFavorite = (id, title) => {
    if (favorites.some(favorite => favorite[1].id === id)) {
      Alert.alert(i18n.t('alreadyfav'))
    } else {
      push(favRef, {
        'id': id,
        'title': title
      });
      Alert.alert(i18n.t('newfav'));
    }
  }

  const setRegionToCurrentLocation = () => {
    setRegion({
      latitude: currentLocation.latitude,
      longitude: currentLocation.longitude,
    });
    getFinnaImgs(currentLocation.latitude, currentLocation.longitude);
  }

  const { navigate } = props.navigation;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      keyboardVerticalOffset={headerHeight}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      backgroundColor={'white'}
    >
      <Header
        height={100}
        backgroundColor='white'
        centerContainerStyle={styles.textinput}
        centerComponent={
          <Input
            placeholder={i18n.t('address')}
            onSubmitEditing={getAddressCoords}
            onChangeText={address => setAddress(address)}
            returnKeyType='search'
            clearButtonMode='always'
            leftIcon={
              <Ionicons
                name='location-outline'
                size={24}
                color='gray'
              />
            }
          />}
        rightComponent={
          <Ionicons
            name={'list'}
            size={32}
            style={styles.headerIcon}
            onPress={() => navigate('List', { finnaImgs: finnaImgs })} />}
      />
      <Divider orientation='horizontal' />
      <MapView
        style={styles.map}
        region={region}
        showsUserLocation={true}
        onPress={Keyboard.dismiss}
        accessible={false}
      >
        <Marker
          coordinate={{
            latitude: region.latitude,
            longitude: region.longitude
          }}
          pinColor="#000"
          tracksViewChanges={false}>
          <Callout tooltip>
            <View>
              <View style={styles.bubble}>
                <Text style={styles.title}>{region.latitude} {region.longitude}</Text>

              </View>
            </View>
          </Callout>
        </Marker>
        {finnaImgs.filter(image => image.geoLocations[0].includes('POINT')).map((image, index) => (
          <Marker
            key={index}
            coordinate={{ latitude: Number(image.geoLocations[0].slice(image.geoLocations[0].lastIndexOf(" ") + 1, image.geoLocations[0].indexOf(")" - 1))), longitude: Number(image.geoLocations[0].slice(image.geoLocations[0].indexOf("(") + 1, image.geoLocations[0].lastIndexOf(" ") - 1)) }}
          >
            <Callout tooltip>
              <View>
                <View style={styles.bubble}>
                  <View style={styles.bubbleIcon}>
                    <Ionicons name="heart" size={32} onPress={() => saveFavorite(image.id, image.title)} />
                    <Ionicons name="information-circle-outline" size={32} onPress={() => navigate('Image', { imageId: image.id })} />
                  </View>
                  <Text style={styles.title}>{image.title}</Text>
                  <Image style={styles.image} source={{ uri: `https://www.finna.fi/Cover/Show?id=${image.id}&index=0&size=large&source=Solr` }} resizeMode="contain" />
                </View>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>
      <View
        style={{
          position: 'absolute',
          bottom: '5%',
          right: '7%',
          alignSelf: 'flex-end'
        }}>
        <Ionicons
          name="navigate"
          size={32}
          onPress={setRegionToCurrentLocation}
        />
      </View>
      <StatusBar />
    </KeyboardAvoidingView>
  );

}

const styles = StyleSheet.create({
  bubble: {
    flexDirection: 'column',
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: 6,
    borderColor: '#ccc',
    borderWidth: 0.5,
    padding: 15,
    maxWidth: 250
  },
  bubbleIcon: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
    marginBottom: 10
  },
  container: {
    flex: 1,
  },
  headerIcon: {
    marginTop: 15,
    marginRight: 15,
  },
  image: {
    height: 200,
    width: 200,
    alignSelf: 'center'
  },
  map: {
    flex: 5,
  },
  textinput: {
    fontSize: 18,
    width: '75%',
    alignSelf: 'center'
  },
  title: {
    fontSize: 16,
    marginBottom: 5,
    alignSelf: 'center'
  },
  search: {
    flex: 1,
  }
});