<?php
// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**
 * @package   local_recitdashboard
 * @copyright 2019 RÉCIT 
 * @license   {@link http://www.gnu.org/licenses/gpl-3.0.html} GNU GPL v3 or later
 */

namespace recitdashboard;

use stdClass;

require_once(dirname(__FILE__).'/PersistCtrl.php');
require_once(dirname(__FILE__)."/recitcommon/tcpdf/tcpdf.php");

class CustomPdf extends \TCPDF
{
    protected $data;
    protected $extraData;

    public function __construct($orientation = 'P', $unit = 'mm', $format = 'A4', $unicode = true, $encoding = 'UTF-8', $diskcache = false) {
        parent::__construct($orientation, $unit, $format, $unicode, $encoding, $diskcache);
        
        // set document information
        $this->SetCreator(PDF_CREATOR);
        $this->SetAuthor(get_string('pluginname', 'local_recitdashboard'));
        //$this->SetTitle('Rapport Test');
        //$this->SetSubject('TCPDF Tutorial');
        //$this->SetKeywords('TCPDF, PDF, example, test, guide');
    }

    //Page header
    /*public function Header() {
        // Logo
        $image_file = K_PATH_IMAGES.'logo_example.jpg';
        $this->Image($image_file, 10, 10, 15, '', 'JPG', '', 'T', false, 300, '', false, false, 0, false, false, false);
        // Set font
        $this->SetFont('helvetica', 'B', 20);
        // Title
        $this->Cell(0, 15, '<< TCPDF Example 003 >>', 0, false, 'C', 0, '', 0, false, 'M', 'M');
    }*/

    // Page footer
    public function Footer() {
        // Position at X mm from bottom
        $this->SetY(-37);

        $this->setCellPaddings(1, 1, 1, 1);

        $this->setCellmargins(0,4,0,0);
        $this->SetFont('times', 'b', 10);
        $this->Cell($this->pctToMm(37), 0, "Nom de l'élève:", 'LT', 0, 'L');
        $this->Cell($this->pctToMm(37), 0, "Signature", 'T', 0, 'L');
        $this->Cell($this->pctToMm(26), 0, "Date:", 'TR', 1, 'L');

        $this->setCellmargins(0,0,0,2);
        $this->SetFont('times', '', 10);
        $this->Cell($this->pctToMm(37), 0, $this->data->fullname, 'LB', 0, 'L');
        $this->Cell($this->pctToMm(37), 0, "___________________________", 'B', 0, 'L');
        $this->Cell($this->pctToMm(26), 0, date('Y-m-d H:i:s', $this->data->answerTimestamp), 'BR', 1, 'L');

        $this->setCellmargins(0,0,0,0);
        $this->SetFont('times', 'b', 10);
        $this->Cell($this->pctToMm(25), 0, "Nom du surveillant:", 'LT', 0, 'L');
        $this->Cell($this->pctToMm(25), 0, "Code permanent", 'T', 0, 'L');
        $this->Cell($this->pctToMm(25), 0, "# de l'épreuve:", 'T', 0, 'L');
        $this->Cell($this->pctToMm(25), 0, "Nombre de mots calculés:", 'TR', 1, 'L');

        $this->SetFont('times', '', 10);
        $this->Cell($this->pctToMm(25), 0, $this->extraData->supervisorName, 'LB', 0, 'L');
        $this->Cell($this->pctToMm(25), 0, "______________________", 'B', 0, 'L');
        $this->Cell($this->pctToMm(25), 0, "_________________", 'B', 0, 'L');
        $this->Cell($this->pctToMm(25), 0, $this->data->nbWords, 'BR', 1, 'L');

        // Page number
        //$this->Cell(0, 10, 'Page '.$this->getAliasNumPage().'/'.$this->getAliasNbPages(), 0, false, 'R', 0, '', 0, false, 'T', 'M');
    }

    public function setCustomData($data, $extraData = null){
        $this->data = $data;

        if($extraData != null){
            $this->extraData = $extraData;
        }
    }

    public function pctToMm($value){
        $availWidth = $this->w - $this->rMargin - $this->lMargin;
        return $availWidth * ($value/100);
    }
}

abstract class PdfWritter
{
	
    /**
     * Nome do arquivo
     * @var string
     */
    protected $pdfName;
    /**
     * Pdf que será escrito a saída
     * @var CustomPdf
     */
    protected $pdf;
    /**
     * Constroi uma instância 
     * @param CustomPdf $pdf PDF que será escrito a saída
     */
    public function __construct(CustomPdf $pdf, $name = null)
    {
        $this->pdf = $pdf;
        if ($name){
            $this->pdfName = $name;
        }
        else{
            $this->pdfName = 'report.pdf';
        }
    }

    /**
     * Retorna o nome do PDF 
     */
    public function GetPdfName()
    {
        return $this->pdfName;
    }
    /**
     * Escreve o relatório
     */
    abstract public function WritePdf($data = null, $newPage = true);

    public function PrintOut($destination = 'I')
    {		
		error_reporting(E_ALL);
        $this->WritePdf();        
		//ob_end_clean();
        return $this->pdf->output($this->pdfName, $destination);
    }
}

class ReportQuizEssayAnswersPdf extends PdfWritter
{
    protected $dataset;
    protected $extraData;
    
    private $marginTop = 25.4; 
    private $marginLeft = 25.4;
    private $marginRight  = 25.4;
    private $marginBottom = 25.4;

    public function __construct()
    {
        parent::__construct(new CustomPdf('P', 'mm', 'LETTER'), 'report.pdf');

        // convert TTF font to TCPDF format and store it on the fonts folder
        //TCPDF_FONTS::addTTFfont('./output/assets/swiss-721-black-bt.ttf', 'TrueType');
    }

    public function WritePdf($data = null, $newPage = true)
    {
        $this->pdf->setPrintHeader(false);

        // set default monospaced font
        $this->pdf->SetDefaultMonospacedFont(PDF_FONT_MONOSPACED);

        $this->pdf->SetMargins($this->marginLeft, $this->marginTop, $this->marginRight);
        $this->pdf->setCellMargins(1, 1, 1, 1);

        // inferior margin
        $this->pdf->SetAutoPageBreak(true, $this->marginBottom);

        // set font
        //$this->pdf->SetFont('times', 'BI', 20);
        $this->pdf->setCustomData(null, $this->extraData);

        foreach($this->dataset as $item){
            $this->pdf->AddPage('p', 'LETTER');
            $this->pdf->setCustomData($item);
            $this->printContent($item);
        }
    }
    
    public function SetDataset(array $dataset, stdClass $extraData){
        $this->dataset = $dataset;
        $this->extraData = $extraData;
    }
    
    protected function printContent($data)
    {
        $this->pdf->SetTextColor(0,0,0);

        $this->pdf->SetXY($this->marginLeft, $this->marginTop);
        $this->pdf->SetFont('times', 'b', 16);
        $this->pdf->MultiCell(0, 0, 'VERSION DÉFINITIVE', 0, 'C');

        $this->pdf->SetFont('times', '', 12);
        $answer = "<div style='line-height: 50px;'>$data->answer</div>";
        $this->pdf->MultiCell(0, 0, $answer, 0, 'L', false, 1, null, null, true, 0, true);


    }
}