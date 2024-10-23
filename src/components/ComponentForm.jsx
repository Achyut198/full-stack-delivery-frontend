import { useState, useEffect } from 'react';
import axios from 'axios';

const ComponentForm = () => {
  const [name, setName] = useState('');
  const [repairPrice, setRepairPrice] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [vehicles, setVehicles] = useState([]);

  // Fetch vehicles from the backend
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/vehicles/');
        setVehicles(response.data);
      } catch (error) {
        console.error('Error fetching vehicles:', error);
      }
    };

    fetchVehicles();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Step 1: Register the component
      const componentResponse = await axios.post('http://localhost:8000/api/components/', {
        name,
        repair_price: repairPrice,
        purchase_price: purchasePrice,
      });

      // Step 2: Create an issue for the newly registered component
      const componentId = componentResponse.data.id; // Assuming the component response contains the ID
      const repairType = 'repair'; // Define the repair type here; you can modify as needed

      const issueResponse = await axios.post('http://localhost:8000/api/issues/', {
        vehicle: vehicleId, // Send the selected vehicle ID
        component: componentId, // Send the registered component ID
        repair_type: repairType, // Define repair type here
      });

      // Step 3: Create a payment for the issue
      const totalPrice = repairPrice; // Or use purchasePrice if that's more appropriate

      await axios.post('http://localhost:8000/api/payments/', {
        issue: issueResponse.data.id, // Assuming the response contains the ID of the created issue
        amount: totalPrice,
      });

      // Clear the form after successful submission
      setName('');
      setRepairPrice('');
      setPurchasePrice('');
      setVehicleId('');
    } catch (error) {
      console.error('Error processing component:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Name</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div>
        <label>Repair Price</label>
        <input type="number" value={repairPrice} onChange={(e) => setRepairPrice(e.target.value)} required />
      </div>
      <div>
        <label>Purchase Price</label>
        <input type="number" value={purchasePrice} onChange={(e) => setPurchasePrice(e.target.value)} required />
      </div>
      <div>
        <label>Select Vehicle</label>
        <select value={vehicleId} onChange={(e) => setVehicleId(e.target.value)} required>
          <option value="">Select a vehicle</option>
          {vehicles.map((vehicle) => (
            <option key={vehicle.id} value={vehicle.id}>
              {vehicle.plate_number} - {vehicle.model}
            </option>
          ))}
        </select>
      </div>
      <button type="submit">Register Component</button>
    </form>
  );
};

export default ComponentForm;
