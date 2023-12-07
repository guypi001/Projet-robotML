let void entry () {
    setSpeed(200 mm) // distance per second (here 200mm/s)
    var number time = getTimestamp()
    loop time < 60000
    {
        var number dist = getDistance() in cm
        Forward dist - 25 in cm
        Clock 90
        time = time + 10000
    }
}