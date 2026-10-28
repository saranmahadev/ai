Not every network needs every weight trained by gradient descent. This section covers three architectures that get most of the way there by other means: a network shaped so its output layer can be solved for exactly, a network whose recurrent core is never trained at all, and the random-features idea pushed to its logical extreme.

Topics in this section:

* [[Radial Basis Function Networks]]: units that respond to how close an input is to a centre, not a dot product.
* [[Reservoir Computing and Liquid State Machines]]: a fixed, untrained recurrent "reservoir" with only the readout trained.
* [[Extreme Learning Machines]]: random hidden weights, with only the output layer solved for.
