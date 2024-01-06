let void entry () {
    var number coun = 0
    loop count < 5
    {	
        setSpeed(500 * (count + 1))
        count = count + 1
        square(count)
    }
}

let void square(number factor){
    Forward 500 * factor
    Clock 90
    Forward 500 * factor
    Clock 90
    Forward 500 * factor
    Clock 90
    Forward 500 * factor
    Clock 90
}