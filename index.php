<!DOCTYPE html>
<html lang="it">
<head>
    <link rel="icon" href="images/logo.png" type="image/png">
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Armadietto TDP</title>
    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="style.css?v=1.2">
    <script src="scripts.js"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
</head>
<body>
    <div class="container-fluid py-4">
        <header class="custom-header mx-auto d-flex justify-content-between align-items-center">
            <div class="logo">Armadietto TDP</div>
            <div class="search-bar">
                <form action="index.php" method="GET" class="d-flex align-items-center">
                    <input type="text" name="search" class="form-control rounded-pill me-2" placeholder="Cerca..." 
                           value="<?php echo isset($_GET['search']) ? htmlspecialchars($_GET['search']) : ''; ?>">
                    <button type="submit" class="btn btn-success px-4">Cerca</button>
                    <a href="index.php" class="btn btn-danger ms-2 px-4">Reset</a>
                    <div class="hamburger-menu">
                        <button type="button" class="hamburger-btn">☰</button>
                        <div class="dropdown-content">
                            <a href="index_calc.html" target="_blank" class="calculate-btn">
                                <i class="fa-solid fa-calculator" style="color: #1271ba;"></i> Calcola Resistenza
                            </a>
                            <a href="https://prof-bernardis.infinityfreeapp.com" target="_blank" class="ideatore-btn">
                                <i class="fa-solid fa-folder" style="color: #1271ba;"></i> Ideatore
                            </a>
                        </div>
                    </div>
                </form>
            </div>
        </header>

        <main class="mt-5">
            <div class="table-responsive">
                <table class="table table-hover custom-table rounded-4">
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>Tipo <button class="btn btn-info btn-sm ms-2" onclick="mostraFiltri()">Filtri</button></th>
                            <th>Posizione</th>
                            <th>Scheda Dati</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php
                        try {
                            $conn = new mysqli("sql204.infinityfree.com", "if0_37692159", "Y3ML3YJPR0zFVK6", "if0_37692159_armadietto_db", 3306);
                            $conn->set_charset("utf8mb4");

                            if ($conn->connect_error) {
                                throw new Exception("Connessione fallita: " . $conn->connect_error);
                            }

                            $filter = isset($_GET['filter']) ? explode(',', $_GET['filter']) : [];
                            $search = isset($_GET['search']) ? trim($conn->real_escape_string($_GET['search'])) : '';
                            $sql = "SELECT * FROM armadietto";
                            $conditions = [];

                            if ($search) {
                                $conditions[] = "(nome LIKE '%$search%' OR tipo LIKE '%$search%')";
                            }

                            if (!empty($filter)) {
                                $filterConditions = [];
                                foreach ($filter as $tipo) {
                                    $filterConditions[] = "tipo LIKE '%$tipo%'";
                                }
                                $conditions[] = '(' . implode(' OR ', $filterConditions) . ')';
                            }

                            if (!empty($conditions)) {
                                $sql .= " WHERE " . implode(' AND ', $conditions);
                            }

                            $result = $conn->query($sql);

                            if ($result->num_rows > 0) {
                                while ($row = $result->fetch_assoc()) {
                                    echo "<tr>
                                        <td>{$row['nome']}</td>
                                        <td>{$row['tipo']}</td>
                                        <td>{$row['posizione']}</td>
                                        <td><a href='{$row['scheda_dati']}' target='_blank' class='btn btn-link'>Scheda Dati</a></td>
                                    </tr>";
                                }
                            } else {
                                echo "<tr><td colspan='4' class='text-center'>Nessun risultato trovato</td></tr>";
                            }

                            $conn->close();
                            
                        } catch (Exception $e) {
                            echo "<tr><td colspan='4' class='text-center text-danger'>Errore nella connessione al database: " . $e->getMessage() . "</td></tr>";
                        }
                        ?>
                    </tbody>
                </table>
            </div>

            <div id="filtriDiv" class="modal fade" tabindex="-1">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Seleziona i Filtri</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <div class="d-flex flex-column">
                                <div class="form-check">
                                    <input type="checkbox" class="form-check-input" name="tipo[]" value="Resistenza" id="resistenza">
                                    <label class="form-check-label" for="resistenza">Resistenza</label>
                                </div>
                                <div class="form-check">
                                    <input type="checkbox" class="form-check-input" name="tipo[]" value="Led" id="led">
                                    <label class="form-check-label" for="led">Led</label>
                                </div>
                                <div class="form-check">
                                    <input type="checkbox" class="form-check-input" name="tipo[]" value="Diodo" id="diodo">
                                    <label class="form-check-label" for="diodo">Diodo</label>
                                </div>
                                <div class="form-check">
                                    <input type="checkbox" class="form-check-input" name="tipo[]" value="Filo" id="filo">
                                    <label class="form-check-label" for="filo">Filo</label>
                                </div>
                                <div class="form-check">
                                    <input type="checkbox" class="form-check-input" name="tipo[]" value="Rame" id="rame">
                                    <label class="form-check-label" for="rame">Rame</label>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button class="btn btn-primary" onclick="applicaFiltri()">Applica Filtri</button>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </div>

    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
