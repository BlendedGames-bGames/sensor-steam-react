class SensorPointModel {
    constructor(id_point_sensor, 
        id_sensor, 
        id_players, 
        data_point,
        date_time,
        hours_played) {
        this.id_point_sensor = id_point_sensor;
        this.id_sensor = id_sensor;
        this.id_players = id_players;
        this.data_point = data_point;
        this.date_time = date_time;
        this.hours_played = hours_played;
    }
}

export default SensorPointModel;