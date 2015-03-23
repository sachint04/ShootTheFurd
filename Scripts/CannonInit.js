var CannonSetup = {
	sphereShape:null, 
	sphereBody:null, 
	physicsMaterial:null, 
	walls:[], 
	balls:[], 
	ballMeshes:[], 
	boxes:[], 
	boxMeshes:[],
	dt : (1/60),
	world:null,
	init : function() {
		// Setup our world
		this.world = new CANNON.World();
		this.world.quatNormalizeSkip = 0;
		this.world.quatNormalizeFast = false;

		var solver = new CANNON.GSSolver();

		this.world.defaultContactMaterial.contactEquationStiffness = 1e9;
		this.world.defaultContactMaterial.contactEquationRegularizationTime = 4;

		solver.iterations = 7;
		solver.tolerance = 0.1;
		var split = true;
		if (split)
			this.world.solver = new CANNON.SplitSolver(solver);
		else
			this.world.solver = solver;

		this.world.gravity.set(0, -300, 0);
		this.world.broadphase = new CANNON.NaiveBroadphase();

		// Create a slippery material (friction coefficient = 0.0)
		this.physicsMaterial = new CANNON.Material("slipperyMaterial");
		var physicsContactMaterial = new CANNON.ContactMaterial(this.physicsMaterial, this.physicsMaterial, 0.0, // friction coefficient
		0.3 // restitution
		);
		// We must add the contact materials to the world
		this.world.addContactMaterial(physicsContactMaterial);

		// Create a sphere
		

		var mass = 5, radius = 50.3;
		this.sphereShape = new CANNON.Sphere(radius);
		this.sphereBody = new CANNON.Body({
			mass : mass,
			material: this.physicsMaterial  
		});
		this.sphereBody.addShape(this.sphereShape);
		this.sphereBody.position.set(0, 52, 120);
		this.sphereBody.linearDamping = 0.9;
		this.world.add(this.sphereBody);

		// Create a plane
		  // Create a plane
        var groundShape = new CANNON.Plane();
        var groundBody = new CANNON.Body({ mass: 0, material: this.physicsMaterial });
        groundBody.addShape(groundShape);
		groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
        groundBody.position.set(0,0,0);
        this.world.add(groundBody);
	}
}