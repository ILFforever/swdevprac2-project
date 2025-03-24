import CarCard from "./car";
import Link from "next/link"

export default async function CarCatalog({CarsJson}: {CarsJson : Promise<VenueJson>}){
    const venuesJsonready = await CarsJson
    return(
        <>
            Explore {venuesJsonready.count} fabulous venues in our venue catalog
            <div style={{margin:"20px", display:"flex", flexDirection:"row", flexWrap:"wrap", justifyContent:"space-around", alignContent:"space-around"}}>
                {
                    venuesJsonready.data.map(carItem:CarItem)=>{
                        return (
                        <Link href={`/venue/${carItem.id}`} className="w-1/5" key={carItem.id}>
                        <CarCard brand={carItem.name} imgSrc={carItem.picture}
                        />
                        </Link>
                    );
                    })
                }
                
            </div>
        </>
    )
}