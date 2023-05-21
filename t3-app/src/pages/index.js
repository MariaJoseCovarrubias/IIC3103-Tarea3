import prisma from "prisma/instance"


export default function Home({
  count,
  CountByType,
  last100Transactions,
}) {
  return (
    <main>
      <h1> OPERACIONES RECIBIDAS: {count} </h1>
      <h1> TIPO DE OPERACIÓN: ENVÍO DE FONDOS </h1>
      <p>Cantidad de Operaciones: {CountByType[1]._count.type}</p>
      <p>Monto Total: ${CountByType[1]._sum.money}</p>
      <h1> TIPO DE OPERACIÓN: REVERSA DE TRANSACCIÓN </h1>
      <p>Cantidad de Operaciones: {CountByType[0]._count.type}</p>
      <p>Monto Total: ${CountByType[0]._sum.money}</p>
      <h1>100 ÚLTIMAS TRANSACCIONES</h1>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Type</th>
            <th>Bank Origin</th>
            <th>Account Origin</th>
            <th>Bank Destination</th>
            <th>Account Destination</th>
            <th>Amount</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {last100Transactions.map(transaction => (
            <tr key={transaction.id}>
              <td>{transaction.id}</td>
              <td>{transaction.type}</td>
              <td>{transaction.bank_origin}</td>
              <td>{transaction.acc_origin}</td>
              <td>{transaction.bank_dest}</td>
              <td>{transaction.acc_dest}</td>
              <td>{transaction.money}</td>
              <td>{transaction.date}</td>
            </tr>
          ))}
        </tbody>
      </table>

  
    </main>
  )
}

export async function getServerSideProps() {
  const count = await prisma.bank_info.count();
// show info by type 

  const data = await prisma.bank_info.findMany({
    select: {
      id: true,
      type: true,
      bank_origin: true,
      acc_origin: true,
      bank_dest: true,
      acc_dest: true,
      money: true,
      date: true,
    },
  });

  const formattedData = data.map(item => ({
    ...item,
    id: item.id.toString(),
    acc_origin: item.acc_origin.toString(),
    money: item.money.toString(),
    acc_dest: item.acc_dest.toString(),
    date: item.date.toString(),
  }));

  const CountByType = await prisma.bank_info.groupBy({
    by: ["type"],
    _count: {
      type: true,
    },
    _sum: {
      money: true,
    },
  });
  const formattedCountByType = CountByType.map(item => ({
    ...item,
    _sum: {
      money: Number(item._sum.money),
    },
  }));

  const conciliation = await prisma.bank_info.groupBy({
    by: ["bank_origin", "bank_dest"],
    _sum: {
      money: true,
    },
  });

  const formattedConciliation = conciliation.map(item => ({
    ...item,
    _sum: {
      money: Number(item._sum.money),
    },
  }));

  const last100Transactions = await prisma.bank_info.findMany({
    orderBy: {
      id: 'asc' 
    },
    take: 100
  });

  const formattedTransaction = last100Transactions.map(item => ({
    ...item,
    id: item.id.toString(),
    acc_origin: item.acc_origin.toString(),
    money: item.money.toString(),
    acc_dest: item.acc_dest.toString(),
    date: item.date.toString(),
  }));
  

  console.log(conciliation);
  return {
    props: {
      count,
      data: formattedData,
      CountByType: formattedCountByType,
      conciliation: formattedConciliation,
      last100Transactions: formattedTransaction,
    },
  };
}
