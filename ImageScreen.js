import React, { useEffect, useState } from 'react';
import { Button, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Localization from 'expo-localization';
import i18n from 'i18n-js';

export default function ImageScreen({ route }) {
  i18n.translations = {
    fi: { unknown: 'Tuntematon', photographer: 'Valokuvaaja', moreinfo: 'Katso lisätietoja Finnasta' },
    sv: { unknown: 'Okänd', photographer: 'Fotograf', moreinfo: 'Se mera på Finna' },
    en: { unknown: 'Unknown', photographer: 'Photographer', moreinfo: 'Se more info on Finna' }
  };
  i18n.locale = Localization.locale;
  i18n.fallbacks = true;

  const { imageId } = route.params;
  const [imageInfo, setImageInfo] = useState({});

  useEffect(() => {
    getImageInfo();
  }, []);

  const getImageInfo = () => {
    const url = `https://api.finna.fi/v1/record?id=${imageId}&lng=fi&prettyPrint=1`;
    fetch(url)
      .then(response => response.json())
      .then(responseData => {
        if (responseData.records[0].nonPresenterAuthors.length == 0) {
          setImageInfo({
            ...imageInfo,
            title: responseData.records[0].title,
            photographer: i18n.t('unknown')
          });
        } else {
          setImageInfo({
            ...imageInfo,
            title: responseData.records[0].title,
            photographer: responseData.records[0].nonPresenterAuthors[0].name
          });
        }
      })
  }

  const _handlePressButtonAsync = async () => {
    await WebBrowser.openBrowserAsync(`https://www.finna.fi/Record/${imageId}`);
  };

  return (
    <SafeAreaView style={styles.container}>
    <ScrollView>
      <Image style={styles.image} source={{ uri: `https://www.finna.fi/Cover/Show?id=${imageId}&index=0&size=large&source=Solr` }} resizeMode="contain" />
      <View style={styles.textCont}>
        <Text style={styles.title}>{imageInfo.title}</Text>
        <Text style={styles.photographer}>{i18n.t('photographer')}: {imageInfo.photographer}</Text>
        <Text style={styles.link} onPress={_handlePressButtonAsync}>{i18n.t('moreinfo')} &gt;</Text>
      </View>
    </ScrollView></SafeAreaView>
  );
  
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  image: {
    flex: 3,
    height: 400,
    width: '90%',
    alignSelf: 'center',
    marginHorizontal: 5, 
    marginVertical: 5,
  },
  link: {
    fontSize: 18,
    textDecorationLine: 'underline',
    color: '#723981',
    alignSelf: 'center',
  },
  photographer: {
    fontSize: 18,
    marginBottom: 5,
    alignSelf: 'center'
  },
  textCont: {
    flex: 1,
    marginTop: 5,
    marginBottom: 15,
    marginHorizontal: 10,
    height: '95%'
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    alignSelf: 'center'
  },
});