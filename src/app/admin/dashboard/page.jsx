
import '@/app/admin/dashboard/dashboard.scss';
import Image from 'next/image';
const Dashboard = () => {
    return (
        <>
            <div className="heading-wrapper">
                <h1>Dashboard</h1>
            </div>
            <div className="dashboard-top-boxes">
                <div className="item">
                    <div className="title">Active Users</div>
                    <div className="num">200</div>
                </div>
                <div className="item">
                    <div className="title">Monthly Orders</div>
                    <div className="num">60</div>
                </div>
                <div className="item">
                    <div className="title">Monthly Revenue</div>
                    <div className="num">20,000</div>
                </div>
                <div className="item">
                    <div className="title">Yearly Sales</div>
                    <div className="num">1,00,000</div>
                </div>
            </div>

            <div className="two-column-section">
                <div className="left-section map-wrapper">
                    <div className="sm-heading">Monthly Sales</div>
                    <div className="img">
                        <Image src={'/images/admin/graph.webp'} alt='graph' width={'718'} height={'355'} />
                    </div>
                </div>
                <div className="right-section latest-products">
                    <div className="sm-heading">Latest Products</div>
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>S.No.</th>
                                    <th>Product Name</th>
                                    <th>Price</th>
                                </tr>
                            </thead>

                            <tbody>
                                <tr>
                                    <td>1</td>
                                    <td>Dummy product</td>
                                    <td>20,000</td>
                                </tr>
                                <tr>
                                    <td>2</td>
                                    <td>Dummy product</td>
                                    <td>20,000</td>
                                </tr>
                                <tr>
                                    <td>3</td>
                                    <td>Dummy product</td>
                                    <td>20,000</td>
                                </tr>
                                <tr>
                                    <td>4</td>
                                    <td>Dummy product</td>
                                    <td>20,000</td>
                                </tr>
                                <tr>
                                    <td>5</td>
                                    <td>Dummy product</td>
                                    <td>20,000</td>
                                </tr>
                                <tr>
                                    <td>6</td>
                                    <td>Dummy product</td>
                                    <td>20,000</td>
                                </tr>
                                <tr>
                                    <td>7</td>
                                    <td>Dummy product</td>
                                    <td>20,000</td>
                                </tr>
                                <tr>
                                    <td>8</td>
                                    <td>Dummy product</td>
                                    <td>20,000</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Dashboard