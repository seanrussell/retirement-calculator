export function normsInv(p, mu, sigma) {
	if (p < 0 || p > 1) {
		throw 'The probality p must be bigger than 0 and smaller than 1';
	}
	if (sigma < 0) {
		throw 'The standard deviation sigma must be positive';
	}

	if (p == 0) {
		return -Infinity;
	}
	if (p == 1) {
		return Infinity;
	}
	if (sigma == 0) {
		return mu;
	}

	var q, r, val;

	q = p - 0.5;

	/*-- use AS 241 --- */
	/* double ppnd16_(double *p, long *ifault)*/
	/*      ALGORITHM AS241  APPL. STATIST. (1988) VOL. 37, NO. 3
            Produces the normal deviate Z corresponding to a given lower
            tail area of P; Z is accurate to about 1 part in 10**16.
    */
	if (Math.abs(q) <= 0.425) {
		/* 0.075 <= p <= 0.925 */
		r = 0.180625 - q * q;
		val =
			(q *
				(((((((r * 2509.0809287301226727 + 33430.575583588128105) * r +
					67265.770927008700853) *
					r +
					45921.953931549871457) *
					r +
					13731.693765509461125) *
					r +
					1971.5909503065514427) *
					r +
					133.14166789178437745) *
					r +
					3.387132872796366608)) /
			(((((((r * 5226.495278852854561 + 28729.085735721942674) * r +
				39307.89580009271061) *
				r +
				21213.794301586595867) *
				r +
				5394.1960214247511077) *
				r +
				687.1870074920579083) *
				r +
				42.313330701600911252) *
				r +
				1);
	} else {
		/* closer than 0.075 from {0,1} boundary */

		/* r = min(p, 1-p) < 0.075 */
		if (q > 0) {
			r = 1 - p;
		} else {
			r = p;
		}

		r = Math.sqrt(-Math.log(r));
		/* r = sqrt(-log(r))  <==>  min(p, 1-p) = exp( - r^2 ) */

		if (r <= 5) {
			/* <==> min(p,1-p) >= exp(-25) ~= 1.3888e-11 */
			r += -1.6;
			val =
				(((((((r * 7.7454501427834140764e-4 + 0.0227238449892691845833) * r +
					0.24178072517745061177) *
					r +
					1.27045825245236838258) *
					r +
					3.64784832476320460504) *
					r +
					5.7694972214606914055) *
					r +
					4.6303378461565452959) *
					r +
					1.42343711074968357734) /
				(((((((r * 1.05075007164441684324e-9 + 5.475938084995344946e-4) * r +
					0.0151986665636164571966) *
					r +
					0.14810397642748007459) *
					r +
					0.68976733498510000455) *
					r +
					1.6763848301838038494) *
					r +
					2.05319162663775882187) *
					r +
					1);
		} else {
			/* very close to  0 or 1 */
			r += -5;
			val =
				(((((((r * 2.01033439929228813265e-7 + 2.71155556874348757815e-5) * r +
					0.0012426609473880784386) *
					r +
					0.026532189526576123093) *
					r +
					0.29656057182850489123) *
					r +
					1.7848265399172913358) *
					r +
					5.4637849111641143699) *
					r +
					6.6579046435011037772) /
				(((((((r * 2.04426310338993978564e-15 + 1.4215117583164458887e-7) * r +
					1.8463183175100546818e-5) *
					r +
					7.868691311456132591e-4) *
					r +
					0.0148753612908506148525) *
					r +
					0.13692988092273580531) *
					r +
					0.59983220655588793769) *
					r +
					1);
		}

		if (q < 0.0) {
			val = -val;
		}
	}

	return mu + sigma * val;
}

export function formatDollars(number) {
	var number = Math.round(number * 100) / 100;

	number = number.toString();
	var dollars = number.split('.')[0];
    var cents = (number.split('.')[1] || '') + '00';
    
	dollars = dollars
		.split('')
		.reverse()
		.join('')
		.replace(/(\d{3}(?!$))/g, '$1,')
		.split('')
		.reverse()
		.join('');
	var number = '$' + dollars + '.' + cents.slice(0, 2);

	return number;
};

export function formatDollarsWithoutCents(number) {
	var number = Math.round(number * 100) / 100;

	number = number.toString();
	var dollars = number.split('.')[0];
    
	dollars = dollars
		.split('')
		.reverse()
		.join('')
		.replace(/(\d{3}(?!$))/g, '$1,')
		.split('')
		.reverse()
		.join('');
	var number = '$' + dollars;

	return number;
};

export function pv(amount, inflation, numYears) {
    for (let i = 0; i < numYears; i++) {
        amount /= (1 + (inflation / 100));
    }

    return amount;
}

export let sp500Avg = 11.45;
export let sp500StdDev = 17.55;
export let sp500 = [
	11.62,
	37.49,
	43.61,
	-8.42,
	-24.9,
	-43.34,
	-8.19,
	53.99,
	-1.44,
	47.67,
	33.92,
	-35.03,
	31.12,
	-0.41,
	-9.78,
	-11.59,
	20.34,
	25.9,
	19.75,
	36.44,
	-8.07,
	5.71,
	5.5,
	18.79,
	31.71,
	24.02,
	18.37,
	-0.99,
	52.62,
	31.56,
	6.56,
	-10.78,
	43.36,
	11.96,
	0.47,
	26.89,
	-8.73,
	22.8,
	16.48,
	12.45,
	-10.06,
	23.98,
	11.06,
	-8.5,
	4.01,
	14.31,
	18.98,
	-14.66,
	-26.47,
	37.2,
	23.84,
	-7.18,
	6.56,
	18.44,
	32.42,
	-4.91,
	21.55,
	22.56,
	6.27,
	31.73,
	18.67,
	5.25,
	16.61,
	31.69,
	-3.1,
	30.47,
	7.62,
	10.08,
	1.32,
	37.58,
	22.96,
	33.36,
	28.58,
	21.04,
	-9.1,
	-11.89,
	-22.1,
	26.68,
	10.88,
	4.91,
	15.79,
	5.49,
	-37.0,
	26.46,
	15.06,
	2.11,
	16.0,
	32.39,
	13.69
];
