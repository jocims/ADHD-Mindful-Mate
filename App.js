import React, { Component } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image,
  TouchableOpacity, 
  TextInput
 } from 'react-native';


class App extends Component {
  render() {
    return (
      
      <View style={styles.container}>

        <Image
          source={require('./src/logo3.png')}
          style={styles.img}
          />


        <Text style={styles.introduction}>Hello There! </Text>


        <View style={styles.form}>

          <Text style={styles.label}>Username: </Text>

          <TextInput 
          placeholder="Enter your username"
          style={styles.input} />  

          <Text style={styles.label}> Password: </Text>

          <TextInput 
          placeholder="Enter your password" secureTextEntry
          style={styles.input} />  

          <View style={styles.resetArea}>
          <TouchableOpacity style={styles.resetBtn}>


          <Text style={styles.resetText}>Forgot your Password?</Text>
          </TouchableOpacity>

          </View>



        <TouchableOpacity style={styles.btn}>

          <View style={styles.btnArea}>
            <Text style={styles.btnText}>Login</Text>

          </View>

        </TouchableOpacity>

        </View>


      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'lightgrey',
    alignItems: 'center',
    justifyContent: 'flex-start', // Align items at the start of the container
    paddingTop: 15,
  },
  img: {
    width: 250,
    height: 250,
    marginBottom: 20,
  },
  introduction: {
    fontSize: 20,
    color: 'black',
    marginBottom: 20,
    fontWeight: 'bold',
  },
  form: {
    paddingTop: 20,
    paddingBottom: 20,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    color: 'black',
    marginBottom : 10,
    fontWeight: 'bold',
  },
  input: { 
    borderWidth: 1.5, 
    width: 300,
    borderColor: 'black', 
    padding: 10, 
    borderRadius: 7, 
    marginBottom: 15,
  },
  btn: {
    width: 150,
    height: 50,
    backgroundColor: '#052458',
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
    opacity: 0.9,
  },
  resetText: {
    fontSize: 14,
    color: 'black',
    marginBottom: 50,
    fontStyle: 'italic',
    alignSelf: 'flex-end', // Align the text to the end of its container
    textAlign: 'right', // Align the text to the right within its container
  },
  resetArea: {
    alignSelf: 'flex-end', // Align the container to the end of its parent
    flexDirection: 'row', // Set the direction of the container to row
    flexDirection:'row', 
    justifyContent:'space-between',
  },
});

export default App;