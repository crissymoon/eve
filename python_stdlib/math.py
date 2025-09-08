# Mathematical functions module

import sys

# Constants
pi = 3.141592653589793
e = 2.718281828459045
tau = 6.283185307179586
inf = float('inf')
nan = float('nan')

# Power and logarithmic functions
def pow(x, y):
    """Return x raised to the power y."""
    return x ** y

def sqrt(x):
    """Return the square root of x."""
    if x < 0:
        raise ValueError("math domain error")
    return x ** 0.5

def log(x, base=None):
    """Return the natural logarithm of x (to base e)."""
    if x <= 0:
        raise ValueError("math domain error")
    import math
    if base is None:
        return math.log(x)
    return math.log(x) / math.log(base)

def log10(x):
    """Return the base-10 logarithm of x."""
    return log(x, 10)

def log2(x):
    """Return the base-2 logarithm of x."""
    return log(x, 2)

def exp(x):
    """Return e raised to the power of x."""
    return e ** x

# Trigonometric functions
def sin(x):
    """Return the sine of x (measured in radians)."""
    import math
    return math.sin(x)

def cos(x):
    """Return the cosine of x (measured in radians)."""
    import math
    return math.cos(x)

def tan(x):
    """Return the tangent of x (measured in radians)."""
    import math
    return math.tan(x)

def asin(x):
    """Return the arc sine of x, in radians."""
    if x < -1 or x > 1:
        raise ValueError("math domain error")
    import math
    return math.asin(x)

def acos(x):
    """Return the arc cosine of x, in radians."""
    if x < -1 or x > 1:
        raise ValueError("math domain error")
    import math
    return math.acos(x)

def atan(x):
    """Return the arc tangent of x, in radians."""
    import math
    return math.atan(x)

def atan2(y, x):
    """Return atan(y / x), in radians."""
    import math
    return math.atan2(y, x)

def radians(x):
    """Convert angle x from degrees to radians."""
    return x * pi / 180.0

def degrees(x):
    """Convert angle x from radians to degrees."""
    return x * 180.0 / pi

# Hyperbolic functions
def sinh(x):
    """Return the hyperbolic sine of x."""
    return (exp(x) - exp(-x)) / 2

def cosh(x):
    """Return the hyperbolic cosine of x."""
    return (exp(x) + exp(-x)) / 2

def tanh(x):
    """Return the hyperbolic tangent of x."""
    return sinh(x) / cosh(x)

# Number-theoretic and representation functions
def ceil(x):
    """Return the ceiling of x, the smallest integer greater than or equal to x."""
    import math
    return math.ceil(x)

def floor(x):
    """Return the floor of x, the largest integer less than or equal to x."""
    import math
    return math.floor(x)

def trunc(x):
    """Truncate x to the nearest integer toward 0."""
    import math
    return math.trunc(x)

def fabs(x):
    """Return the absolute value of x."""
    return abs(x)

def factorial(x):
    """Return x factorial as an integer."""
    if x < 0 or not isinstance(x, int):
        raise ValueError("factorial() only accepts integral values")
    if x == 0 or x == 1:
        return 1
    result = 1
    for i in range(2, x + 1):
        result *= i
    return result

def gcd(a, b):
    """Return the greatest common divisor of integers a and b."""
    while b:
        a, b = b, a % b
    return abs(a)

def lcm(a, b):
    """Return the least common multiple of integers a and b."""
    return abs(a * b) // gcd(a, b)

def isfinite(x):
    """Return True if x is neither an infinity nor a NaN, and False otherwise."""
    return x != inf and x != -inf and x == x

def isinf(x):
    """Return True if x is a positive or negative infinity, and False otherwise."""
    return x == inf or x == -inf

def isnan(x):
    """Return True if x is a NaN (not a number), and False otherwise."""
    return x != x

def copysign(x, y):
    """Return a float with the magnitude (absolute value) of x but the sign of y."""
    if y >= 0:
        return fabs(x)
    else:
        return -fabs(x)

def fmod(x, y):
    """Return fmod(x, y), as defined by the platform C library."""
    return x - floor(x / y) * y

def frexp(x):
    """Return the mantissa and exponent of x as the pair (m, e)."""
    import math
    return math.frexp(x)

def ldexp(x, i):
    """Return x * (2**i)."""
    return x * (2 ** i)

def modf(x):
    """Return the fractional and integer parts of x."""
    import math
    return math.modf(x)

# Special functions
def gamma(x):
    """Return the Gamma function at x."""
    import math
    return math.gamma(x)

def lgamma(x):
    """Return the natural logarithm of the absolute value of the Gamma function at x."""
    import math
    return math.lgamma(x)

def erf(x):
    """Return the error function at x."""
    import math
    return math.erf(x)

def erfc(x):
    """Return the complementary error function at x."""
    import math
    return math.erfc(x)
