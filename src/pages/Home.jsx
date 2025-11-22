
import { Link } from 'react-router-dom'

function Home() {
  return (
    <div
      style={{
        backgroundImage: "url('https://t3.ftcdn.net/jpg/08/15/90/80/360_F_815908053_Mfy2DJfv1iFSdL6ET9pRD5R5VzOOEu5k.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }}
    >
      <div className="text-center d-flex flex-column p-3">

        <Link to={"/wish"}
          className="btn btn-success m-3"
          style={{ padding: "15px 40px", fontSize: "20px", borderRadius: "12px" ,fontFamily:"Georgia, serif"}}
        >
          Your Wishlist
        </Link>

        <Link to={"/stillreading"}
          className="btn btn-success m-3"
          style={{ padding: "15px 40px", fontSize: "20px", borderRadius: "12px",fontFamily:"Georgia, serif" }}
        >
          Currently Reading
        </Link>

        <Link  to={"/red"}
          className="btn btn-success m-3"
          style={{ padding: "15px 40px", fontSize: "20px", borderRadius: "12px",fontFamily:"Georgia, serif" }}
        >
          Read Books
        </Link>


      </div>
    </div>
  )
}

export default Home
