// function to get the greatest common divisor
def gcd(a : Int, b : Int) : Int = b match{
    case 0 => a
    case x if x > a => gcd(x, a)
    case _ => gcd(b, a%b)
}


//function to check if an int is prime
def prime(p : Int, n : Int=2) : Boolean = n match{
    case x if(x==p) => true
    case x if gcd(p, x) > 1 => false
    case x => prime(p, x+1)
}

@main def main() : Unit = {
    println(prime(8))
    println(prime(5))
}