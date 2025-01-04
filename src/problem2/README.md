# Assumptions

1. **Interchangeable Currencies for Enhanced UX**

   - Users can swap the input and output currencies to improve usability and efficiency.

2. **Editable Input and Output Fields**

   - Both the input and output currencies, as well as their respective amounts, can be edited by the user.

3. **Dynamic Recalculation**

   - Modifying the **Input Currency** or **Input Amount** will trigger an automatic recalculation of the **Output Amount**.
   - Similarly, editing the **Output Currency** or **Output Amount** will result in a recalculation of the **Input Amount**.

4. **Default Settings**

   - The default input currency is set to **USD**.
   - The default output currency is set to **ETH**.

5. **Real-Time Data Fetching**
   - Currency data and exchange rates are dynamically fetched from the API endpoint: [https://interview.switcheo.com/prices.json](https://interview.switcheo.com/prices.json).
