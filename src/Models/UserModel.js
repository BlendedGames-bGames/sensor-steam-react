class UserModel {
    constructor(id_players, 
      name, 
      email, 
      password,
      key_steam,
      id_user_steam,
      id_reddit) {
      this.id_players = id_players;
      this.name = name;
      this.email = email;
      this.password = password;
      this.key_steam = key_steam;
      this.id_user_steam = id_user_steam;
      this.id_reddit = id_reddit;
    }
  }
  
  export default UserModel;