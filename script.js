
        document.getElementById('ProductForm').addEventListener('submit', function (e) {
            e.preventDefault();

            const product = {
                id: parseInt(document.getElementById('ProductId').value),
                name: document.getElementById('ProductName').value.trim(),
                price: parseFloat(document.getElementById('ProductPrice').value),
                quantity: parseInt(document.getElementById('ProductQuantity').value),
                category: document.getElementById('Cat').value.trim()
            };

            addProduct(product);
        });

        function addProduct(productData) {
            let storedProduct = JSON.parse(localStorage.getItem('ProdData')) || [];
            if (!Array.isArray(storedProduct)) storedProduct = [];
            storedProduct.push(productData);
            localStorage.setItem('ProdData', JSON.stringify(storedProduct));
            renderProducts();
        }

        function deleteProduct(index) {
            let storedProduct = JSON.parse(localStorage.getItem('ProdData')) || [];
            storedProduct.splice(index, 1);
            localStorage.setItem('ProdData', JSON.stringify(storedProduct));
            renderProducts();
        }

        function updateStock(productId, quantityChange) {
            let storedProduct = JSON.parse(localStorage.getItem('ProdData')) || [];
            const productIndex = storedProduct.findIndex(p => p.id === productId);

            if (productIndex === -1) return;

            if (quantityChange < 0) {
                if (storedProduct[productIndex].quantity > 0) {
                    storedProduct[productIndex].quantity += quantityChange;
                    storedProduct[productIndex].soldQuantity = (storedProduct[productIndex].soldQuantity || 0) + Math.abs(quantityChange);
                } else {
                    console.log("สินค้าไม่มีในสต็อกแล้ว");
                    return;
                }
            } else {
                storedProduct[productIndex].quantity += quantityChange;
            }

            localStorage.setItem('ProdData', JSON.stringify(storedProduct));
            renderProducts();
            generateSalesReport();
            checkLowStock(productId);
        }

        function checkLowStock(productId) {
            let storedProduct = JSON.parse(localStorage.getItem('ProdData')) || [];
            const product = storedProduct.find(p => p.id === productId);
            if (!product) return;
            if (product.quantity < 5) {
                console.log(`สินค้า ${product.name} มีสต็อกต่ำกว่า 5 ชิ้น`);
            }
        }

        function generateSalesReport() {
            let salesData = JSON.parse(localStorage.getItem('ProdData')) || [];
            let salesSummary = {};

            salesData.forEach(product => {
                if (!salesSummary[product.id]) {
                    salesSummary[product.id] = {
                        id: product.id,
                        name: product.name,
                        totalQuantity: 0,
                        totalRevenue: 0
                    };
                }

                salesSummary[product.id].totalQuantity = product.soldQuantity || 0;
                salesSummary[product.id].totalRevenue = salesSummary[product.id].totalQuantity * product.price;
            });

            let summaryArray = Object.values(salesSummary);
            summaryArray.sort((a, b) => b.totalQuantity - a.totalQuantity);
            let bestSeller = summaryArray[0];

            if (bestSeller && bestSeller.totalQuantity > 0) {
                console.log(`สินค้าขายดีอันดับ 1: ${bestSeller.name} (ID: ${bestSeller.id}) - จำนวนขาย: ${bestSeller.totalQuantity}, ยอดขาย: ${bestSeller.totalRevenue} บาท`);

                const reportContainer = document.getElementById('salesReportDisplay');
                if (reportContainer) {
                    reportContainer.innerHTML = `
                <h2>สินค้าขายดีอันดับ 1</h2>
                <p>ชื่อสินค้า: ${bestSeller.name}</p>
                <p>รหัสสินค้า: ${bestSeller.id}</p>
                <p>จำนวนขาย: ${bestSeller.totalQuantity}</p>
                <p>ยอดขายรวม: ${bestSeller.totalRevenue} บาท</p>
            `;
                }
            } else {
                console.log("ไม่พบข้อมูลการขาย");
                document.getElementById('salesReportDisplay').innerHTML = "<p>ไม่พบข้อมูลการขาย</p>";
            }
        }

        function renderProducts() {
            let storedProduct = JSON.parse(localStorage.getItem('ProdData')) || [];
            const productContainer = document.getElementById("productDisplay");
            productContainer.innerHTML = "";

            storedProduct.forEach((product, index) => {
                const productItem = document.createElement("div");
                productItem.innerHTML = `
          <p>รหัสสินค้า: ${product.id}</p>
          <p>ชื่อสินค้า: ${product.name}</p>
          <p>ราคา: ${product.price} บาท</p>
          <p>จำนวนคงเหลือ: ${product.quantity}</p>
          <p>ประเภท: ${product.category}</p>
          <button onclick="deleteProduct(${index})">ลบสินค้า</button>
          <button onclick="updateStock(${product.id}, -1)">ขาย 1 ชิ้น</button>
          <button onclick="updateStock(${product.id}, 1)">เพิ่มสต็อก 1 ชิ้น</button>
          <hr>
        `;
                productContainer.appendChild(productItem);
            });
        }

        renderProducts();
